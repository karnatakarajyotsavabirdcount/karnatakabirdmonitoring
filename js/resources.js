const contactModal = document.getElementById("contact-form-modal");
const openContactForm = document.getElementById("open-contact-form");
const closeContactForm = document.getElementById("close-contact-form");

openContactForm.addEventListener("click", () => contactModal.showModal());
closeContactForm.addEventListener("click", () => contactModal.close());

contactModal.addEventListener("click", (event) => {
  if (event.target === contactModal) {
    contactModal.close();
  }
});
