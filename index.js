const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
// SHOW_URL = INDEX_URL + '/:id'

const friends = [];
let filteredCard = [];
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector("#paginator");
const CARD_PER_PAGE = 12;
const navFavorite = document.querySelector("nav-fav");
const searchForm = document.querySelector("#search-form");
const btnInput = document.querySelector("#btn-input");
const shiftCardAndList = document.querySelector('#shift-card-and-list')

function renderFriendsList(file) {
  if (dataPanel.dataset.mode === 'card-mode'){
    let rawHTML = "";
    file.forEach((item) => {
      rawHTML += `
  <div class="bg-white m-2 pt-4 d-flex flex-column align-items-center rounded-4" style="width: 15rem;">
      <img type="button" src="${item.avatar}" class="card-img-top w-auto h-75 rounded-circle" id="card-img" data-bs-toggle="modal" data-bs-target="#modal-btn" alt="avatar-img" data-id="${item.id}">
      <div class="card-body d-flex flex-column align-items-center">
        <h5 class="card-title text-center" id="card-title">${item.name} ${item.surname}</h5>
        <p class="card-text" id="card-age">
        ${item.age} | ${item.gender} | <i class="fa-regular fa-heart text-danger" data-id="${item.id}"></i>
        </p>
      </div>
    </div>
  `;
    });

    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = `<ul class="list-group col-sm-12 mb-2" id="render-friend-list">`;

    file.forEach((item) => {
      rawHTML += `
    <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.name} ${item.surname}</h5>
        <div>
          <button id="list-more" class="btn btn-outline-primary mx-2" data-bs-toggle="modal" data-bs-target="#modal-btn" data-id="${item.id}">More</button>
          <i class="fa-regular fa-heart text-danger " data-id="${item.id}"></i>
        </div>
    </li>
  `;
    });

    rawHTML += `</ul>`;

    dataPanel.innerHTML = rawHTML;
  }
  
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteLists")) || [];
  // 從好友清單去find
  const friend = friends.find((friend) => friend.id === id);

  if (list.some(friend => friend.id === id)) {
    return alert("此好友將從喜好清單中移除")
  }

  list.push(friend);
  localStorage.setItem("favoriteLists", JSON.stringify(list));
}

function removeFromFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteLists")) || [];
  // .find() .findIndex() 作用是差不多的，只是後者會回傳index
  // 從list去findIndex
  const friendIndex = list.findIndex(friend => friend.id === id)
  // 傳入的 id 在收藏清單中不存在，就結束這個函式，index這種東西如果找不到東西，就會回傳-1
  if (friendIndex === -1) return

  list.splice(friendIndex, 1)

  localStorage.setItem('favoriteLists', JSON.stringify(list))
}

function showFriendModal(id) {
  const modalName = document.querySelector("#modal-name");
  const modalGender = document.querySelector("#modal-gender");
  const modalAge = document.querySelector("#modal-age");
  const modalBirthday = document.querySelector("#modal-birthday");
  const modalAvatar = document.querySelector("#modal-avatar");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    modalName.innerText = data.name + " " + data.surname;
    modalGender.innerText = "gender: " + data.gender;
    modalAge.innerText = "age: " + data.age;
    modalBirthday.innerText = "birthday: " + data.birthday;
    modalAvatar.src = data.avatar;
  });
}

// Shift mode
// 在dataPanel上面綁data-mode，可以任使用者切換模式
function shiftMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) {
    return
  }else {
    dataPanel.dataset.mode = displayMode
  }
  }


function renderPaginator(cardTotal) {
  // 200 / 18 = 11...2
  const amount = Math.ceil(cardTotal / CARD_PER_PAGE);
  let rawHTML = `<li class="page-item">
      <a class="page-link minus" id="-1">Previous</a>
    </li>`;

  for (let page = 1; page <= amount; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-id="${page}">${page}</a></li>
    `;
  }
  rawHTML += `<li class="page-item">
      <a class="page-link add" href="#" id="+1">Next</a>
    </li>`;

  paginator.innerHTML = rawHTML;
}

function getCardByPage(page) {
  // page 1  card 0-17
  // page 2  card 18-35
  // page 3  card 36-53
  const data = filteredCard.length ? filteredCard : friends;
  const startIndex = (page - 1) * CARD_PER_PAGE;
  return data.slice(startIndex, startIndex + CARD_PER_PAGE);
}

searchForm.addEventListener("submit", function onSearchBtnSubmitted(event) {
  event.preventDefault();
  let keyword = btnInput.value.trim().toLowerCase();

  filteredCard = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(keyword) ||
      friend.surname.toLowerCase().includes(keyword)
  );

  if (filteredCard.length === 0) {
    return alert(`找不到關鍵字：${btnInput.value.trim()}`);
  }

  renderFriendsList(getCardByPage(1));
  renderPaginator(filteredCard.length);
});

// Shift card mode or list mode
shiftCardAndList.addEventListener("click", function onＳhiftClicked(event) {
  if (event.target.matches(".fa-th")) {
    shiftMode("card-mode");
    renderFriendsList(getCardByPage(currentPage));
    console.log(dataPanel.dataset.mode)
  } else if (event.target.matches(".fa-bars")) {
    shiftMode("list-mode");
    renderFriendsList(getCardByPage(currentPage));
    console.log(dataPanel.dataset.mode)
  }
});


// Card
dataPanel.addEventListener("click", function (event) {
  if (event.target.matches("#card-img") || event.target.matches("#list-more")) {
    showFriendModal(Number(event.target.dataset.id));
    console.log(Number(event.target.dataset.id));
  }

  //   新增:加入/移除喜好清單，並改變愛心實心＆空心
  const id = Number(event.target.dataset.id);
  if (event.target.matches(".fa-regular")) {
    event.target.classList = "fa-solid fa-heart text-danger";
    addToFavorite(id);
  } else if (event.target.matches(".fa-solid")) {
    event.target.classList = "fa-regular fa-heart text-danger";
    removeFromFavorite(id);
    console.log(id)
    return alert("此好友將從喜好清單中移除");
  }
});

// Paginator
// 要用現在的頁碼進行上下一頁的功能，所以要宣告一個變數
let currentPage = 1;

paginator.addEventListener("click", function onPaginatorClicked(event) {
  const page = Number(event.target.dataset.id);
  const classList = event.target.classList;
  const maxPage = Math.ceil(friends.length / CARD_PER_PAGE);
  if (page > 0 && page <= maxPage && !classList.contains("add")) {
    renderFriendsList(getCardByPage(page));
    console.log(page);
    currentPage = page;
  } else if (classList.contains("minus") && currentPage > 1) {
    renderFriendsList(getCardByPage(currentPage - 1));
    currentPage--;
    console.log(currentPage);
  } else if (classList.contains("add") && currentPage < maxPage) {
    renderFriendsList(getCardByPage(currentPage + 1));
    currentPage++;
    console.log(currentPage);
  }
});

//這裡要放INDEX_URL，而不是BASE_URL
axios.get(INDEX_URL).then((response) => {
  friends.push(...response.data.results);
  renderFriendsList(getCardByPage(1));
  renderPaginator(friends.length);
});
