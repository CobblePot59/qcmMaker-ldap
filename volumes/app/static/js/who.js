function storeIdentity() {
    const form = $("#whoForm");
    const name = $("#name").val();
    const surname = $("#surname").val();

    localStorage.setItem("name", name);
    localStorage.setItem("surname", surname);

    form.submit();
}