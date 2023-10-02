$(document).ready(function () {
    $('#edit').on('show.bs.modal', function(event) {
        const categoryName = $(event.relatedTarget).data('anchor-category-name');
        $("#span-category-name").text(categoryName);  
    });
});

function updateCategory() {
    $.ajax({
      type: "PUT",
      url: "/category/" + encodeURIComponent($("#span-category-name").text()),
      data: { category_name: $("#modal-category-name").val() },
      success: function(response) {
        location.reload();
    }
    });
}

function deleteCategory(categoryName) {
    $.ajax({
      type: "DELETE",
      url: "/category/" + encodeURIComponent(categoryName),
      success: function(response) {
        location.reload();
    }
    });
}

function deleteQuiz(quizName) {
    $.ajax({
      type: "DELETE",
      url: "/quiz/" + encodeURIComponent(quizName),
      success: function(response) {
        location.reload();
    }
    });
}

function playQuiz(quizName) {
    $.ajax({
        type: 'GET',
        url: '/quiz/' + quizName,
        success: function(response) {
            window.location.href = response.url;
    },
  });
}

function copyURL(quizName) {
    $.ajax({
        type: 'GET',
        url: '/quiz/' + quizName,
        success: function(data) {
            let textArea = document.createElement("textarea");
            textArea.value = data.url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
    },
  });
}