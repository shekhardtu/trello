const trello = (function() {
  var createCard = {
    windowOverlay: document.getElementById("container-main"),
    node: document.getElementById("card-edit"),
    titleNode: document.getElementById("card-edit__title"),
    card: undefined,
  };

  createCard.clearInputs = function() {
    createCard.titleNode.value = "";
  };

  //This will called on the close button
  createCard.close = function() {
    createCard.card = undefined;
    createCard.clearInputs();
    createCard.node.style.display = "none";
    createCard.windowOverlay.style.display = "none";
  };

  //This method will show the edited text on the card on submit
  createCard.show = function() {
    createCard.windowOverlay.style.display = "block";
    createCard.node.style.display = "block";
  };

  //This method will submit the edited text
  createCard.submit = function(evt) {
    evt.preventDefault();
    var title = createCard.titleNode.value.trim();

    if (title) {
      createCard.card.title = title;
      createCard.card.titleNode.replaceChild(
        document.createTextNode(title),
        createCard.card.titleNode.childNodes[0]
      );
    }
    createCard.close();
  };

  /*
  This method deletes the card
  */
  var cardDeleteTrello = {};
  var currentBoard;

  cardDeleteTrello.delete = function() {
    var index = currentBoard.cards[createCard.card.id].index;

    currentBoard.removeCard(createCard.card);
    currentBoard.addNewCard(createCard.card.list, index + 1, -1);

    createCard.card.list.cardsNode.removeChild(createCard.card.node);
    createCard.card.list.cards.splice(index, 1);

    createCard.close();
    createCard.card = undefined;
  };

  /*
This method is called to build the card form
*/
  function buildCardTitleForm() {
    var node = document.createElement("form");
    node.className = "card-form";
    node.innerHTML = `<div class="card-form--wrpr"> 
                        <input class="card-form__input" type="text"/> 
                        <input class="card-form__submit" type="submit" value="Add">
                      </div>`;
    node.style.display = "none";
    return node;
  }
  /*
  This method will build the form for list,It is called by addList
  */
  function buildListTitleForm() {
    var node = document.createElement("form");
    node.className = "list-form";
    node.innerHTML =
      '<div class="list-form--wrpr">' +
      '<input class="list-form__input" type="text">' +
      '<input class="list-form__submit" type="submit" value="Save">' +
      "</div>";
    node.style.display = "none";
    return node;
  }

  //This method will called on adding the list on the board
  function addListTrello(board) {
    return function() {
      var titleInput = document.querySelector(".list-form__input");

      document.querySelector(".list-form__submit").onclick = titleButtonClick;
      board.titleFormNode.style.display = "block";
      titleInput.focus();

      function titleButtonClick(evt) {
        evt.preventDefault();
        var title = titleInput.value.trim(),
          index = board.lists.length - 1,
          list;

        board.titleFormNode.style.display = "none";
        titleInput.value = "";
        if (!title) {
          return;
        }

        list = new List(board, title, index);
        board.lists.splice(index, 0, list);
        board.listsNode.insertBefore(list.node, board.lists[index + 1].node);
        board.lists[index + 1].titleNode.setAttribute("list-index", index + 1);
      }
    };
  }

  //Board constructor object and assign some properties to its prototype
  function Board(title) {
    var nextId = 0;

    this.title = title;
    this.lists = [];
    this.cards = {};

    this.node = document.createElement("div");
    this.titleNode = document.createElement("div");
    this.listsNode = document.createElement("div");

    this.node.id = "board";
    this.titleNode.id = "board__title";
    this.listsNode.id = "board__canvas";

    // new list title form
    this.titleFormNode = buildListTitleForm();
    this.titleNode.appendChild(document.createTextNode(this.title));

    this.getNextId = function() {
      return "_" + (nextId++).toString();
    };
  }

  Board.prototype.render = function() {
    this.lists.push(new List(this, "Add a list...", 0, true));
    for (var i = 0; i < this.lists.length; ++i) {
      this.listsNode.appendChild(this.lists[i].node);
    }
    this.lists[this.lists.length - 1].node.appendChild(this.titleFormNode);
    this.lists[this.lists.length - 1].titleNode.onclick = addListTrello(this);
    this.node.appendChild(this.titleNode);
    this.node.appendChild(this.listsNode);
  };

  Board.prototype.createCard = function(card, index) {
    this.cards[card.id] = {
      card: card,
      list: card.list,
      index: index,
    };
  };

  Board.prototype.addNewCard = function(list, index, shift) {
    for (var i = index; i < list.cards.length; ++i) {
      this.createCard(list.cards[i], i + shift);
    }
  };

  Board.prototype.removeCard = function(card) {
    delete this.cards[card.id];
  };

  document.getElementById("card-edit__close").onclick = createCard.close;

  document.getElementById("card-edit__submit").onclick = createCard.submit;

  document.getElementById("card-edit__delete").onclick =
    cardDeleteTrello.delete;

  createCard.windowOverlay.onclick = createCard.close;

  //if you click on escape then also the edit window will get closed
  window.onkeydown = function(evt) {
    if (evt.keyCode === 27) {
      createCard.close();
    }
  };

  function List(board, title, index, dummyList) {
    this.board = board;
    this.dummyList = dummyList;
    this.title = title;
    this.index = index;
    this.node = document.createElement("div");
    this.titleNode = document.createElement("div");
    this.cardsNode = document.createElement("div");
    this.node.classList.add("list");
    this.titleNode.classList.add("list-title");
    this.cardsNode.classList.add("list-cards");
    this.titleNode.setAttribute("list-index", index);
    this.titleNode.appendChild(document.createTextNode(this.title));
    this.node.appendChild(this.titleNode);

    if (!dummyList) {
      var dummyCard = new Card(this, "Add a card...", 0);

      this.titleNode.draggable = true;
      this.cards = [dummyCard];
      board.createCard(this.cards[0], 0);

      // new card title form
      this.titleFormNode = buildCardTitleForm();

      for (var i = 0; i < this.cards.length; ++i) {
        this.cardsNode.appendChild(this.cards[i].node);
      }
      dummyCard.titleNode.onclick = addCardTrello(this);
      this.node.appendChild(this.cardsNode);

      dummyCard.node.appendChild(this.titleFormNode);
      dummyCard.node.draggable = false;

      dummyCard.node.onclick = undefined;
    }

    // drag-drop handlers
    this.titleNode.ondragstart = function(evt) {
      var index = parseInt(evt.target.getAttribute("list-index"), 10);
      dragTracker.list = currentBoard.lists[index];
      evt.dataTransfer.effectAllowed = "move";
    };

    this.titleNode.ondragover = function(evt) {
      if (dragTracker.list) {
        evt.preventDefault();
      }
    };

    this.titleNode.ondrop = function(evt) {
      var sourceIndex = dragTracker.list.index,
        targetIndex = parseInt(this.getAttribute("list-index"), 10),
        numLists = board.lists.length,
        i;

      if (sourceIndex === targetIndex) {
        return;
      }

      board.listsNode.removeChild(dragTracker.list.node);
      board.listsNode.insertBefore(
        dragTracker.list.node,
        board.lists[targetIndex].node
      );

      for (i = sourceIndex; i < numLists - 1; ++i) {
        board.lists[i] = board.lists[i + 1];
        board.lists[i].titleNode.setAttribute("list-index", i);
        board.lists[i].index = i;
      }
      for (i = numLists - 1; i > targetIndex; --i) {
        board.lists[i] = board.lists[i - 1];
        board.lists[i].titleNode.setAttribute("list-index", i);
        board.lists[i].index = i;
      }
      board.lists[targetIndex] = dragTracker.list;
      board.lists[targetIndex].titleNode.setAttribute(
        "list-index",
        targetIndex
      );
      board.lists[targetIndex].index = targetIndex;
      evt.preventDefault();
    };

    this.titleNode.ondragend = function() {
      dragTracker.list = undefined;
    };
  }

  var dragTracker = {
    id: undefined,
    list: undefined,
  };

  //this function will build the card node
  function buildCardNode() {
    var node = document.createElement("div");
    node.draggable = true;
    node.innerHTML = '<div class="card-title"></div>';
    return node;
  }

  /*
This methods is constructor function for card
*/
  function Card(list, title) {
    this.id = list.board.getNextId();
    this.list = list;
    this.title = title;
    this.node = buildCardNode();

    this.titleNode = this.node.getElementsByClassName("card-title")[0];

    this.node.classList.add("card");
    this.node.setAttribute("card-id", this.id);
    this.titleNode.appendChild(document.createTextNode(this.title));

    /*
    These four methods will work on drag and drop of the card on another list
    */
    this.node.ondragstart = (function(id) {
      return function(evt) {
        dragTracker.id = id;
        evt.dataTransfer.effectAllowed = "move";
      };
    })(this.id);

    this.node.ondragover = function(evt) {
      if (dragTracker.id) {
        evt.preventDefault();
      }
    };

    this.node.ondrop = (function(board) {
      return function(evt) {
        var id = dragTracker.id,
          targetId = this.getAttribute("card-id"), // 'this' is target of drop
          source = board.cards[id],
          target = board.cards[targetId];

        if (id === targetId) {
          return;
        }

        source.list.cardsNode.removeChild(source.card.node);
        target.list.cardsNode.insertBefore(source.card.node, target.card.node);

        board.addNewCard(source.list, source.index + 1, -1);
        source.list.cards.splice(source.index, 1);

        board.addNewCard(target.list, target.index + 1, 1);
        target.list.cards.splice(target.index + 1, 0, source.card);

        source.card.list = target.list;
        board.createCard(source.card, target.index + 1);
        evt.preventDefault();
      };
    })(list.board);

    this.node.ondragend = function() {
      dragTracker.id = undefined;
    };

    // this function will be called once you click on the text to edit
    this.node.onclick = (function(card) {
      return function() {
        createCard.card = card;
        createCard.titleNode.value = card.title;
        createCard.show();
      };
    })(this);
  }

  /*
This function will add the Card in the list
*/

  function addCardTrello(list) {
    return function() {
      var titleTextarea = list.titleFormNode.getElementsByClassName(
        "card-form__input"
      )[0];
      list.titleFormNode.getElementsByClassName(
        "card-form__submit"
      )[0].onclick = titleSubmit;
      list.titleFormNode.style.display = "block";
      titleTextarea.focus();

      function titleSubmit(evt) {
        evt.preventDefault();
        var title = titleTextarea.value.trim(),
          card;

        list.titleFormNode.style.display = "none";
        titleTextarea.value = "";
        if (!title) {
          return;
        }

        card = new Card(list, title);
        list.board.createCard(card, list.cards.length);
        list.cardsNode.insertBefore(
          card.node,
          list.cards[list.cards.length - 1].node
        );
        list.cards.push(card);
      }
    };
  }

  var init = function() {
    var title = "Business Launch",
      board = new Board(title);

    board.render();
    document.getElementById("sprint").appendChild(board.node);
    currentBoard = board;
  };

  return {
    init: init,
  };
})();

//Onloading the document render the board.The code starts from here

document.addEventListener("DOMContentLoaded", trello.init);
