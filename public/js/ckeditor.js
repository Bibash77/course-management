import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

document.addEventListener("DOMContentLoaded", function () {
    const editorElement = document.querySelector("#editor");
    if (editorElement) {
        ClassicEditor.create(editorElement).catch(error => console.error("CKEditor Error:", error));
    }
});
