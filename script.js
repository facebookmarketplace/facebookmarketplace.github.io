$(document).ready(function () {
  $("#image-list").sortable();
  $("#image-list").disableSelection();
});

const excelFileInput = document.getElementById("excelFileInput");
const container = document.getElementById("container");
const specificColumnIndices = [0, 1, 2, 3, 4, 5, 6, 26, 27, 28, 29, 32];
const dropArea = document.querySelector(".drag-area");
const dragText = document.querySelector(".header");
let button = dropArea.querySelector(".button");
let input = dropArea.querySelector("input");
let file;
button.onclick = () => {
  input.click();
};
// when browse
input.addEventListener("change", function () {
  file = this.files[0];
  handleFileUpload();
  dropArea.classList.add("active");
});
// when file is inside drag area
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("active");
  dragText.textContent = "Release to Upload";
  // console.log('File is inside the drag area');
});
// when file leave the drag area
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
  // console.log('File left the drag area');
  dragText.textContent = "Drag & Drop";
});
// when file is dropped
dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  // console.log('File is dropped in drag area');
  file = event.dataTransfer.files[0]; // grab single file even of user selects multiple files
  handleFileUpload();
  // console.log(file);
});

function handleFileUpload() {
  // const file = event.target.files[0];
  if (!file) {
    alert("No file selected");
    return;
  }
  container.innerHTML = "";
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const excelSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const numRows = document.getElementById("numrows").value;
    let excelData_raw;
    if (numRows) {
      excelData_raw = excelSheet.slice(0, parseInt(numRows) + 1);
    } else {
      let rowIndex = 0;
      for (; rowIndex < excelSheet.length; rowIndex++) {
        if (!excelSheet[rowIndex][0]) {
          break;
        }
      }
      excelData_raw = excelSheet.slice(0, rowIndex);
    }

    const excelData = excelData_raw.slice(1);
    const excelHeader = excelData_raw[0];

    const summarySection = document.createElement("div");
    summarySection.classList.add("summary-section");
    container.appendChild(summarySection);
    const header = document.createElement("h2");
    header.textContent = "Summary List";
    summarySection.appendChild(header);
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex"; // Set the container to flex display

    const checkAllButton = document.createElement("button");
    checkAllButton.id = "checkAllButton";
    checkAllButton.textContent = "Select All";

    const saveButton = document.createElement("button");
    saveButton.id = "saveButton";
    saveButton.textContent = "Save Excel";
    saveButton.addEventListener("click", saveDataToExcel);

    let isChecked = false;

    // Add a click event listener to the "Check All" button
    checkAllButton.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(".summary-checkbox");
      checkboxes.forEach((checkbox) => {
        checkbox.checked = !isChecked;
      });

      // Update the isChecked flag
      isChecked = !isChecked;
    });
    buttonContainer.appendChild(checkAllButton);
    buttonContainer.appendChild(saveButton);

    summarySection.appendChild(buttonContainer);

    excelData.forEach((rowData, index) => {
      // Create a div to hold the checkbox and summary-item
      const summaryRow = document.createElement("div");
      summaryRow.classList.add("summary-row");
      const addButton = document.createElement("span");
      addButton.textContent = "+";
      addButton.classList.add("add-button");
      addButton.setAttribute("data-index", index);

      // Add a click event listener to the "+" button
      addButton.addEventListener("click", () => {
        // Create a new summary item and container for the selected row
        const newIndex =
          summarySection.querySelectorAll(".summary-row").length + 1;
        const newRowData = excelData[index]; // Get the data for the new row
        const newSummaryRow = document.createElement("div");
        newSummaryRow.classList.add("summary-row");
        newSummaryRow.style.backgroundColor = "#d0f0c0";
        newSummaryRow.addEventListener("mouseover", function () {
          newSummaryRow.style.backgroundColor = "#e8f4f8";
        });

        newSummaryRow.addEventListener("mouseout", function () {
          newSummaryRow.style.backgroundColor = "#d0f0c0";
        });
        const newCheckbox = document.createElement("input");
        newCheckbox.type = "checkbox";
        newCheckbox.classList.add("summary-checkbox");
        newCheckbox.setAttribute("data-index", newIndex);
        const newSummaryItem = document.createElement("div");
        newSummaryItem.classList.add("summary-item");
        newSummaryItem.textContent = `#${newIndex}: ${newRowData[0]}`;
        newSummaryRow.appendChild(newCheckbox);
        newSummaryRow.appendChild(newSummaryItem);
        summarySection.appendChild(newSummaryRow);

        const newContainer = createNewContainer(
          newIndex,
          newRowData,
          excelHeader
        );

        container.appendChild(newContainer);
        $(".sortable-list").sortable();
        // Add a click event listener to the new summary item
        newSummaryItem.addEventListener("click", () => {
          const containers = document.querySelectorAll(".container");
          console.log(containers.length);
          containers[newIndex - 1].scrollIntoView({ behavior: "smooth" });
        });
      });

      // Append the "+" button to the summary row
      summaryRow.appendChild(addButton);

      // Create a checkbox input
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("summary-checkbox");
      checkbox.setAttribute("data-index", index); // Set a data attribute to store the index

      // Create the summary-item
      const summaryItem = document.createElement("div");
      summaryItem.classList.add("summary-item");
      summaryItem.textContent = `#${index + 1}: ${rowData[0]}`;

      // Add a click event listener to navigate to the corresponding container
      summaryItem.addEventListener("click", () => {
        const containers = document.querySelectorAll(".container");
        if (containers.length > index) {
          containers[index].scrollIntoView({ behavior: "smooth" });
        }
      });

      // Append the checkbox and summary-item to the summaryRow
      summaryRow.appendChild(checkbox);
      summaryRow.appendChild(summaryItem);

      // Append the summaryRow to the summarySection
      summarySection.appendChild(summaryRow);

      const rowContainer = document.createElement("div");
      rowContainer.classList.add("container");
      const header = document.createElement("h2");
      header.textContent = `# ${index + 1}`;
      rowContainer.appendChild(header);
      const leftHalf = document.createElement("div");
      leftHalf.classList.add("left-half");
      const rightHalf = document.createElement("div");
      rightHalf.classList.add("right-half");
      const propertyForm = document.createElement("div");
      propertyForm.classList.add("propertyForm");

      specificColumnIndices.forEach((columnIndex) => {
        const formField = document.createElement("div");
        formField.classList.add("form-field");
        const label = document.createElement("label");
        label.textContent = `${excelHeader[columnIndex]} : `;
        formField.appendChild(label);
        if (columnIndex == 3) {
          const textarea = document.createElement("textarea");
          textarea.id = "description";
          textarea.name = "description";
          textarea.rows = "40";
          textarea.cols = "50";
          if (rowData[columnIndex] !== undefined) {
            textarea.value = rowData[columnIndex];
          }
          formField.appendChild(textarea);
        } else {
          const input = document.createElement("input");
          input.type = "text";
          input.name = `Column_${columnIndex}`;
          if (rowData[columnIndex] !== undefined) {
            input.value = rowData[columnIndex];
          }
          input.classList.add("custom-input");
          formField.appendChild(input);
        }
        propertyForm.appendChild(formField);
      });
      leftHalf.appendChild(propertyForm);
      const imageList = document.createElement("ul");
      imageList.className = "sortable-list ui-sortable";
      imageList.id = "image-list";
      imageList.innerHTML = "";
      let selectedFiles = "";
      if (rowData[4] && rowData[4].trim() !== "") {
        selectedFiles = rowData[4].split(",");
      }
      for (let i = 0; i < selectedFiles.length - 1; i++) {
        const listItem = document.createElement("li");
        listItem.className = "image-item ui-sortable-handle";
        const image = document.createElement("img");
        image.src = selectedFiles[i];
        listItem.appendChild(image);
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
          removeImage(listItem, selectedFiles[i]);
        });
        listItem.appendChild(deleteButton);
        imageList.appendChild(listItem);
      }
      rightHalf.appendChild(imageList);
      rowContainer.appendChild(leftHalf);
      rowContainer.appendChild(rightHalf);
      addImageFileInput(rowContainer);
      attachRemoveAllImageButton(rowContainer);
      container.appendChild(rowContainer);
    });
    $(".sortable-list").sortable();
  };
  reader.readAsArrayBuffer(file);
}

function addImagesFromFileInput(input, container) {
  const rightHalf = container.querySelector(".right-half");
  const imageList = rightHalf.querySelector(".sortable-list");

  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i];

    if (file.type.startsWith("image/")) {
      const listItem = document.createElement("li");
      listItem.className = "image-item ui-sortable-handle";

      const image = document.createElement("img");
      const reader = new FileReader();
      reader.onload = function (e) {
        var resultString = e.target.result;
        var base64Data = resultString.split(",")[1];
        var formData = new FormData();
        formData.append("image", base64Data);

        const targetEndpoint =
          "https://api.imgbb.com/1/upload?key=14851c6ea6b77863394ed02115dcad24";

        fetch(targetEndpoint, {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log(data.data.image.url);
            image.src = data.data.image.url;
          })
          .catch((error) => {
            console.error("Fetch Error:", error);
          });
      };
      reader.readAsDataURL(file);

      listItem.appendChild(image);
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        removeImage(listItem, file);
      });
      listItem.appendChild(deleteButton);
      imageList.appendChild(listItem);
    }
  }
}

function addImageFileInput(container) {
  const rightHalf = container.querySelector(".right-half");
  const inputField = document.createElement("input");
  inputField.type = "file";
  inputField.multiple = true;
  inputField.accept = "image/*";
  inputField.addEventListener("change", () =>
    addImagesFromFileInput(inputField, container)
  );
  inputField.style.marginTop = "10px";
  rightHalf.appendChild(inputField);
}

function removeAllImage(container) {
  const imageList = container.querySelector("#image-list");
  while (imageList.firstChild) {
    imageList.removeChild(imageList.firstChild);
  }
}

function attachRemoveAllImageButton(container) {
  const removeAllImagesButton = document.createElement("button");
  removeAllImagesButton.textContent = "Remove All Images";
  removeAllImagesButton.addEventListener("click", () =>
    removeAllImage(container)
  );
  const rightHalf = container.querySelector(".right-half");
  removeAllImagesButton.style.marginTop = "10px";
  rightHalf.appendChild(removeAllImagesButton);
}

function removeImage(listItem, imageUrl) {
  const imageList = listItem.parentNode;
  imageList.removeChild(listItem);
}

function saveDataToExcel() {
  const selectedIndices = getSelectedRowIndices();
  const containers = document.querySelectorAll(".container");
  const data = [];
  selectedIndices.forEach((index) => {
    const container = containers[index];
    const inputs = container.querySelectorAll('input[name^="Column_"]');
    const textarea = container.querySelector('textarea[name="description"]');
    const imageList = container.querySelector("#image-list");
    const imageItems = imageList ? imageList.querySelectorAll("li img") : [];
    const imagePaths =
      imageItems.length > 0
        ? Array.from(imageItems).map((img) => img.getAttribute("src"))
        : "";
    let concatenatedPaths = "";
    if (imageItems.length > 0) {
      concatenatedPaths = imagePaths.join(",") + ",";
    }
    const rowData = [];
    inputs.forEach((input) => {
      rowData.push(input.value);
    });
    rowData.splice(3, 0, textarea.value);
    rowData[4] = concatenatedPaths;
    data.push(rowData);
  });
  const columnIndices = [0, 1, 2, 3, 4, 5, 6, 26, 27, 28, 29, 32];
  const header = [
    "ชื่อ",
    "ราคา",
    "หมวดหมู่/ประเภทอสังหาริมทรัพย์",
    "รายละเอียดสินค้า/คำอธิบายอสังหาริมทรัพย์",
    "รูปภาพ",
    "จังหวัด/ที่อยู่ของอสังหาริมทรัพย์",
    "สภาพสินค้า: มือสอง - เหมือนใหม่, มือสอง - สภาพดี, มือสอง - สภาพพอใช้, ใหม่",
    "แบรนด์,แพลตฟอร์ม",
    "ขนาด",
    "แท็กสินค้า",
    "ผู้ให้บริการ",
    "ชื่ออุปกรณ์",
    "ประเภทยานพาหนะ",
    "หมายเลขประจำยานพาหนะ (ไม่บังคับ)",
    "ปี",
    "ยี่ห้อ",
    "รุ่น",
    "ระยะทางสะสม",
    "ประเภทน้ำมันเชื้อเพลิง",
    "รูปแบบตัวถังรถยนต์",
    "เกียร์",
    "สภาพยานพาหนะ",
    "วัสดุ",
    "สี",
    'ความพร้อมจำหน่าย| ลงประกาศเป็น "มีสินค้า" | ลงประกาศเป็นสินค้าชิ้นเดียว',
    "",
    "สำหรับขายหรือเช่า",
    "จำนวนห้องนอน",
    "จำนวนห้องน้ำ",
    "ตารางเมตร",
    "เลี้ยงแมวได้",
    "เลี้ยงสุนัขได้",
    "วันที่เข้าพักได้",
  ];
  let ws = XLSX.utils.aoa_to_sheet([]);
  const targetData = [header];
  data.forEach((dataRow) => {
    const rowData = new Array(header.length).fill("");
    columnIndices.forEach((columnIndex, index) => {
      rowData[columnIndex] = dataRow[index];
    });
    targetData.push(rowData);
  });
  XLSX.utils.sheet_add_aoa(ws, targetData);
  const maxRowIndex = targetData.length;
  const maxColIndex = header.length - 1;
  ws["!ref"] = XLSX.utils.encode_range({
    s: { c: 0, r: 0 },
    e: { c: maxColIndex, r: maxRowIndex },
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet");
  XLSX.writeFile(wb, "data-post.xlsx");
}

// Function to create a new container with left-half and right-half information
function createNewContainer(index, rowData, excelHeader) {
  const rowContainer = document.createElement("div");
  rowContainer.classList.add("container");
  const header = document.createElement("h2");
  header.textContent = `# ${index}`;
  rowContainer.appendChild(header);

  // Left-half
  const leftHalf = document.createElement("div");
  leftHalf.classList.add("left-half");
  const propertyForm = document.createElement("div");
  propertyForm.classList.add("propertyForm");
  specificColumnIndices.forEach((columnIndex) => {
    const formField = document.createElement("div");
    formField.classList.add("form-field");
    const label = document.createElement("label");
    label.textContent = `${excelHeader[columnIndex]} : `;
    formField.appendChild(label);
    if (columnIndex == 3) {
      const textarea = document.createElement("textarea");
      textarea.id = "description";
      textarea.name = "description";
      textarea.rows = "40";
      textarea.cols = "50";
      if (rowData[columnIndex] !== undefined) {
        textarea.value = rowData[columnIndex];
      }
      formField.appendChild(textarea);
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.name = `Column_${columnIndex}`;
      if (rowData[columnIndex] !== undefined) {
        input.value = rowData[columnIndex];
      }
      input.classList.add("custom-input");
      formField.appendChild(input);
    }
    propertyForm.appendChild(formField);
  });
  leftHalf.appendChild(propertyForm);

  // Right-half
  const rightHalf = document.createElement("div");
  rightHalf.classList.add("right-half");
  const imageList = document.createElement("ul");
  imageList.className = "sortable-list ui-sortable";
  imageList.id = "image-list";
  imageList.innerHTML = "";
  let selectedFiles = "";
  if (rowData[4] && rowData[4].trim() !== "") {
    selectedFiles = rowData[4].split(",");
  }
  for (let i = 0; i < selectedFiles.length - 1; i++) {
    const listItem = document.createElement("li");
    listItem.className = "image-item ui-sortable-handle";
    const image = document.createElement("img");
    image.src = selectedFiles[i];
    listItem.appendChild(image);
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      removeImage(listItem, selectedFiles[i]);
    });
    listItem.appendChild(deleteButton);
    imageList.appendChild(listItem);
  }
  rightHalf.appendChild(imageList);

  rowContainer.appendChild(leftHalf);
  rowContainer.appendChild(rightHalf);
  addImageFileInput(rowContainer);
  attachRemoveAllImageButton(rowContainer);

  return rowContainer;
}

function getSelectedRowIndices() {
  const checkboxes = document.querySelectorAll(".summary-checkbox");
  const selectedIndices = [];
  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      selectedIndices.push(index);
    }
  });
  return selectedIndices;
}
