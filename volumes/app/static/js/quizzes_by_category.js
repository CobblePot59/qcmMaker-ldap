$(document).ready(function () {
    $("#data").DataTable({
    order: [[0, 'desc']],
    columns: [
        {orderable: true, searchable: true},
        {orderable: false, searchable: false},
        ],
    });
});