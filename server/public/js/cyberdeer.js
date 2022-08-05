let hidden = false;

let modal = [];
$(document).ready(function() {

  $(".terminal>img").on({
    click: function() {
      console.log("Image clicked!");
      console.log($(this).attr('src'));
      showModal('<img class="modal-image" id="img01" name="img01" src="' + $(this).attr('src') + '">');
    }
  });

  $(".close").on({
    click: function() {
      closeModal();
    }
  });
  // $(".modal").on({
  //   click: function(){
  //     closeModal();
  //   }
  // });
});
