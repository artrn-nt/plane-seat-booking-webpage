// Main page
const flightSelect = document.getElementById('flight-select');
const preniumPrice = document.getElementById('seat-prenium-price');
const legroomPrice = document.getElementById('seat-legroom-price');
const frontPrice = document.getElementById('seat-front-price');
const standardPrice = document.getElementById('seat-standard-price');
const orderContainer = document.getElementById('order-container');
const detailContainer = document.getElementById('detail-container');
const orderForm = document.getElementById('order-form');
const countText = document.getElementById('countText');
const seatMap = document.querySelector('.seat-map');
const allSeats = document.querySelectorAll('.row .seat');
const errorMsg = document.getElementById('error-msg');
let availableSeats = document.querySelectorAll('.row .seat:not(.unavailable)');
let unavailableSeats = document.querySelectorAll('.row .seat.unavailable');

// Confirmation message
const confirmMsg = document.getElementById('message');
const detailOutput = document.getElementById('detail-output');
const closeMsgBtn = document.getElementById('close-msg');

// Login form
const loginContainer = document.getElementById('login-container');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('log-username');
const loginPassword = document.getElementById('log-password');
const logBtn = document.getElementById('log-btn');
const closeLoginBtn = document.getElementById('close-login');

// Register form
const registerContainer = document.getElementById('register-container');
const registerForm = document.getElementById('register-form');
const registerUsername = document.getElementById('reg-username');
const email = document.getElementById('email');
const registerPassword = document.getElementById('reg-password');
const confPassword = document.getElementById('password');
const registerBtn = document.getElementById('register-btn');
const closeRegisterBtn = document.getElementById('close-register');

// Description
const descriptionContainer = document.querySelector('.description-container');
const infoBtn = document.getElementById('info-btn');
const closeDescriptionBtn = document.getElementById('close-description');

// Ticket price per flight and per type of seat -- ex: 'NY-CH' is element[0] => [prenium ticket price[0], 
// legroom ticket price[1], front ticket price[2], standard ticket price[3]]
const data = [[200, 140, 90, 80], [240, 180, 130, 120], [280, 220, 170, 160], [350, 290, 240, 230], [370, 310, 260, 250],
[390, 330, 270, 260], [300, 240, 190, 180], [270, 210, 160, 150]];

// Initialize ticket prices in showcase with data from index [0] of the above data array
const initialFlightRates = data[0];
let [preniumTicketPrice, legroomTicketPrice, frontTicketPrice, standardTicketPrice] = initialFlightRates;

const initIndexUnavailableSeats = [...unavailableSeats].map(seat => [...allSeats].indexOf(seat));

let currentFlight = formatFlightName(flightSelect.options[0].text);
let currentSelectionArr = [];
let currentSeatsPositions = [];
let currentTotalAmount = 0;

populateUI();

// Format flight name for further submission
function formatFlightName(flightName) {

    return (flightName.charAt(0) + flightName.charAt(4) + '_' + flightName.slice(10, 12) + '_' + flightName.slice(15, 18) + '_' + flightName.slice(flightName.indexOf(',', 9) + 2, flightName.indexOf(',', 9) + 4)).toUpperCase();

}

// Save selected flight index and selected flight rates
function setFlightData(flightIndex, flightName, currentFlightRates) {

    localStorage.setItem('selectedFlightIndex', flightIndex);
    localStorage.setItem('flightName', flightName);
    localStorage.setItem('selectedFlightRates', JSON.stringify(currentFlightRates));

}

// Update showcase content
function updateShowcaseContent() {

    preniumPrice.innerText = formatMoney(preniumTicketPrice);
    legroomPrice.innerText = formatMoney(legroomTicketPrice);
    frontPrice.innerText = formatMoney(frontTicketPrice);
    standardPrice.innerText = formatMoney(standardTicketPrice);

}

// Format number as money
function formatMoney(number) {

    return '$' + number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

}

// Update count, total and order data
function updateSelectedCount() {

    const selectedPreniumSeats = document.querySelectorAll('.row .seat.prenium.selected');
    const selectedLegroomSeats = document.querySelectorAll('.row .seat.legroom.selected');
    const selectedFrontSeats = document.querySelectorAll('.row .seat.front.selected');
    const selectedStandardSeats = document.querySelectorAll('.row .seat.standard.selected');

    let selectedSeatsCount = (selectedPreniumSeats.length)
        + (selectedLegroomSeats.length)
        + (selectedFrontSeats.length)
        + (selectedStandardSeats.length);

    currentTotalAmount = (selectedPreniumSeats.length * preniumTicketPrice)
        + (selectedLegroomSeats.length * legroomTicketPrice)
        + (selectedFrontSeats.length * frontTicketPrice)
        + (selectedStandardSeats.length * standardTicketPrice);

    if (selectedSeatsCount <= 1) {
        countText.innerHTML = `You have selected <span>${selectedSeatsCount}</span> seat for a total price of <span>${formatMoney(currentTotalAmount)}</span>`;
    } else {
        countText.innerHTML = `You have selected <span>${selectedSeatsCount}</span> seats for a total price of <span>${formatMoney(currentTotalAmount)}</span>`;
    }

    let detailPreniumSeats = [selectedPreniumSeats.length, preniumTicketPrice];
    let detailLegroomSeats = [selectedLegroomSeats.length, legroomTicketPrice];
    let detailFrontSeats = [selectedFrontSeats.length, frontTicketPrice];
    let detailStandardSeats = [selectedStandardSeats.length, standardTicketPrice];

    // Spread operator - Initialize order data based on selected seats (user selection)
    let orderData = [...detailPreniumSeats, ...detailLegroomSeats, ...detailFrontSeats, ...detailStandardSeats];

    addDataSelection(orderData);

    const seatsIndex = [...selectedPreniumSeats, ...selectedLegroomSeats, ...selectedFrontSeats, ...selectedStandardSeats].map(seat => [...availableSeats].indexOf(seat));

    localStorage.setItem('selectedSeats', JSON.stringify(seatsIndex));

}

// Push the order data (user selection) into a specific array (currentSelectionArr[]) for further treatment 
function addDataSelection(arr) {

    arr.forEach(item => {
        currentSelectionArr.push(item);
    });

    if (currentSelectionArr.length < 9) {
        currentSelectionArr = [...currentSelectionArr];
    } else {
        currentSelectionArr = currentSelectionArr.slice(8);
    }

}

// Return a clean array of data for order detail display (DOM update)
function cleanData(arr) {

    const seatTypes = ['Prenium', 'Extra-legroom', 'Front', 'Standard'];
    const ranks = ['1', '2', '3', '4'];

    let notNullValuesIndexes = [];
    let currentRanks = [];
    let currentSeatTypes = [];
    let currentPrices = [];

    let result = [];

    const nbSeatsFilter = (arr) => {
        return arr.filter(el => arr.indexOf(el) % 2 == 0);
    }

    let notNullSeats = nbSeatsFilter(arr).filter(el => el !== 0);

    let filteredPrices = arr.filter(el => arr.indexOf(el) % 2 !== 0);

    nbSeatsFilter(arr).forEach((el, index) => {
        if (el !== 0) {
            notNullValuesIndexes.push(index);
        }
    });

    const pushIntoCurrent = (arr, indexesArr, currentArr) => {
        arr.forEach((el, index1) => {
            indexesArr.forEach(index2 => {
                if (index1 == index2) {
                    currentArr.push(el);
                }
            });
        });
    }

    pushIntoCurrent(ranks, notNullValuesIndexes, currentRanks);
    pushIntoCurrent(seatTypes, notNullValuesIndexes, currentSeatTypes);
    pushIntoCurrent(filteredPrices, notNullValuesIndexes, currentPrices);

    while (notNullSeats.length > 0) {
        result.push(currentRanks.splice(0, 1).concat(currentSeatTypes.splice(0, 1).concat(notNullSeats.splice(0, 1).concat(currentPrices.splice(0, 1)))));
    }

    return result;

}

// Return a clean array of data for seats positions submission (DOM update)
function cleanSeatsPositions(arr) {

    let preRowArr = [];
    let legRowArr = [];
    let frontRowArr = [];
    let standRowArr = [];

    let result = [];

    for (let el of arr) {

        if (+el.substring(1) == 1 || +el.substring(1) == 2) {
            preRowArr.push(el);
        } else if (+el.substring(1) == 3 || +el.substring(1) == 4) {
            legRowArr.push(el);
        } else if (+el.substring(1) >= 5 && +el.substring(1) <= 8) {
            frontRowArr.push(el);
        } else if (+el.substring(1) >= 7) {
            standRowArr.push(el);
        }

    }

    result.push(preRowArr.sort(), legRowArr.sort(), frontRowArr.sort(), standRowArr.sort());

    return result.filter(item => item.length > 0);

}

// Update DOM
function updateDOM(providedData = cleanData(currentSelectionArr), positionsData = cleanSeatsPositions(currentSeatsPositions)) {

    const detailList = document.getElementById('detail-list');

    let currentTypesOfSeat = [];
    let currentNbTypeOfSeat = [];
    let currentPrices = [];

    let mapedProvidedData = providedData.map(([rank, type, nb, price]) => ({ rank, type, nb, price }));

    mapedProvidedData.forEach(obj => {
        currentTypesOfSeat.push(obj.type);
        currentNbTypeOfSeat.push(obj.nb);
        currentPrices.push(obj.price);
    });

    const formatCurrentTypesOfSeat = (arr, data) => {
        for (let type of arr) {
            for (let obj of data) {
                if (arr.indexOf(type) == data.indexOf(obj)) {
                    arr.splice(arr.indexOf(type), 1, 'detail ' + type.toLowerCase() + '_' + obj.rank);
                }
            }
        }
        return arr;
    }

    formatCurrentTypesOfSeat(currentTypesOfSeat, mapedProvidedData);

    if (detailList == null && providedData.length > 0) {

        const detailTitle = document.createElement('h2');
        detailTitle.classList.add('detail-title', 'fi');
        detailTitle.textContent = 'Detail';
        detailContainer.appendChild(detailTitle);

        const detailList = document.createElement('ul');
        detailList.setAttribute('id', 'detail-list');
        detailList.classList.add('detail-list');
        detailContainer.appendChild(detailList);

        providedData.forEach(item => {

            positionsData.forEach(el => {

                if (providedData.indexOf(item) == positionsData.indexOf(el)) {

                    const li = document.createElement('li');
                    li.classList.add('detail', item[1].toLowerCase() + '_' + item[0], 'fi');
                    li.innerHTML = `<div class="label_${item[1].toLowerCase().charAt(0)}"></div><small class="detail-type">${item[1]} seat x${item[2]}</small><div class="wrap"><div class="dot"></div><small class="total-item-price">
                    <strong>${formatMoney(item[3] * item[2])}</strong></small></div><input type="hidden" id="orderItem_${item[1].toLowerCase().slice(0, 2)}" name="orderItem_${item[1].toLowerCase().slice(0, 2)}" value="FLIGHT:${currentFlight}_TYPE:${item[1]}_NB:${item[2]}_TOT:${item[3] * item[2]}_SEAT(S):${el.join('_')}"></input>`;
                    detailList.appendChild(li);

                }

            });
        });

        localStorage.setItem('detailContent', JSON.stringify(detailContainer.innerHTML));

    } else if (detailList && providedData.length > 0) {

        const detailListChildren = document.querySelector('.detail-list').children;
        const cleanChildClassName = (str) => { return str.slice(0, str.indexOf(' ', 7)); }

        let detailListChildrenClasses = [];
        let listedNbTypeOfSeat = [];
        let rawListedPrices = [];

        Array.from(detailListChildren).forEach(child => {

            detailListChildrenClasses.push(child.className.slice(0, child.className.indexOf(' ', 7)));
            listedNbTypeOfSeat.push(+child.children[1].innerText.match(/\d+/g).join(''));
            rawListedPrices.push(+child.children[2].innerText.slice(1, child.children[2].innerText.indexOf('.')).replace(',', ''));

        });

        let cleanListedPrices = rawListedPrices.map((n, i) => n / listedNbTypeOfSeat[i]);

        if (currentTypesOfSeat.length == Array.from(detailListChildren).length) {

            const comparePrices = (arr1, arr2) => {
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i] == arr2[i]) {
                        continue;
                    } else if (arr1[i] !== arr2[i]) {
                        return -1;
                    }
                }
                return 1;
            }

            if (comparePrices(currentPrices, cleanListedPrices) == 1) {

                var typeToReplace = '';

                const compareNb = (arr1, arr2) => {
                    for (let i = 0; i < arr1.length; i++) {
                        if (arr1[i] >= arr2[i]) {
                            continue;
                        } else if (arr1[i] <= arr2[i]) {
                            return -1;
                        }
                    }
                    return 1;
                }

                const getTypeToReplace = (arr1, arr2, arr3) => {

                    let index = 0;
                    let type = '';

                    arr1 = arr1.map((n, i) => n - arr2[i]);

                    for (let i = 0; i < arr1.length; i++) {
                        if (arr1[i] == 1) {
                            index = arr1.indexOf(arr1[i]);
                        }
                    }

                    arr3.forEach((el, index1) => {
                        if (index == index1) {
                            type = el;
                        }
                    });

                    return type;

                }

                if (compareNb(currentNbTypeOfSeat, listedNbTypeOfSeat) == 1) {

                    var typeToReplace = getTypeToReplace(currentNbTypeOfSeat, listedNbTypeOfSeat, currentTypesOfSeat).slice(-1);

                } else if (compareNb(currentNbTypeOfSeat, listedNbTypeOfSeat) == -1) {

                    var typeToReplace = getTypeToReplace(listedNbTypeOfSeat, currentNbTypeOfSeat, currentTypesOfSeat).slice(-1);

                }

                Array.from(detailListChildren).forEach(child => {

                    if (child.className.includes(typeToReplace)) {

                        currentTypesOfSeat.forEach(type => {

                            providedData.forEach(item => {

                                positionsData.forEach(el => {

                                    if (cleanChildClassName(child.className) == type && currentTypesOfSeat.indexOf(type) == providedData.indexOf(item) && providedData.indexOf(item) == positionsData.indexOf(el)) {

                                        const li = document.createElement('li');
                                        li.classList.add('detail', item[1].toLowerCase() + '_' + item[0], 'fi');
                                        li.innerHTML = `<div class="label_${item[1].toLowerCase().charAt(0)}"></div><small class="detail-type">${item[1]} seat x${item[2]}</small><div class="wrap"><div class="dot"></div><small class="total-item-price">
                                                    <strong>${formatMoney(item[3] * item[2])}</strong></small></div><input type="hidden" id="orderItem_${item[1].toLowerCase().slice(0, 2)}" name="orderItem_${item[1].toLowerCase().slice(0, 2)}" value="FLIGHT:${currentFlight}_TYPE:${item[1]}_NB:${item[2]}_TOT:${item[3] * item[2]}_SEAT(S):${el.join('_')}"></input>`;

                                        detailList.replaceChild(li, child);
                                    }

                                });
                            });
                        });
                    }
                });

            } else if (comparePrices(currentPrices, cleanListedPrices) == -1) {

                Array.from(detailListChildren).forEach(child => {

                    currentTypesOfSeat.forEach(type => {

                        providedData.forEach(item => {

                            positionsData.forEach(el => {

                                if (cleanChildClassName(child.className) == type && currentTypesOfSeat.indexOf(type) == providedData.indexOf(item) && providedData.indexOf(item) == positionsData.indexOf(el)) {

                                    const li = document.createElement('li');
                                    li.classList.add('detail', item[1].toLowerCase() + '_' + item[0], 'fi');
                                    li.innerHTML = `<div class="label_${item[1].toLowerCase().charAt(0)}"></div><small class="detail-type">${item[1]} seat x${item[2]}</small><div class="wrap"><div class="dot"></div><small class="total-item-price">
                                                <strong>${formatMoney(item[3] * item[2])}</strong></small></div><input type="hidden" id="orderItem_${item[1].toLowerCase().slice(0, 2)}" name="orderItem_${item[1].toLowerCase().slice(0, 2)}" value="FLIGHT:${currentFlight}_TYPE:${item[1]}_NB:${item[2]}_TOT:${item[3] * item[2]}_SEAT(S):${el.join('_')}"></input>`;

                                    detailList.replaceChild(li, child);
                                }

                            });
                        });
                    });
                });
            }

        } else if (currentTypesOfSeat.length > Array.from(detailListChildren).length) {

            let lastTypeOfSeat = currentTypesOfSeat.filter(el => !detailListChildrenClasses.includes(el)).join().slice(7);

            let cleanLastTypeOfSeat = (lastTypeOfSeat.charAt(0).toUpperCase() + lastTypeOfSeat.slice(1, -2)).split();

            let copyDetailListChildrenClasses = [...detailListChildrenClasses];

            const transformIntoIntArr = (arr) => {
                for (let el of arr) {
                    arr.splice(arr.indexOf(el), 1, +el.slice(-1));
                }
                return arr;
            }

            let intArr = transformIntoIntArr(copyDetailListChildrenClasses);

            const getLowestRank = (arr) => { return Math.max(...arr); }

            const getHighestRank = (arr) => { return Math.min(...arr); }

            let lowestRank = getLowestRank(intArr);

            let highestRank = getHighestRank(intArr);

            const getInterval = (arr) => {
                for (let i = 0; i < arr.length - 1; i++) {
                    if (arr[i + 1] - arr[i] > 1) {
                        return arr[i + 1];
                    }
                }
            }

            for (let type of cleanLastTypeOfSeat) {

                providedData.forEach(item => {

                    const appendListItem = (item0, item1, item2, item3) => {

                        positionsData.forEach(el => {

                            if (item.includes(type) && providedData.indexOf(item) == positionsData.indexOf(el)) {

                                const li = document.createElement('li');
                                li.classList.add('detail', item1.toLowerCase() + '_' + item0, 'fi');
                                li.innerHTML = `<div class="label_${item1.toLowerCase().charAt(0)}"></div><small class="detail-type">${item1} seat x${item2}</small><div class="wrap"><div class="dot"></div><small class="total-item-price">
                                <strong>${formatMoney(item3 * item2)}</strong></small></div><input type="hidden" id="orderItem_${item1.toLowerCase().slice(0, 2)}" name="orderItem_${item1.toLowerCase().slice(0, 2)}" value="FLIGHT:${currentFlight}_TYPE:${item1}_NB:${item2}_TOT:${item3 * item2}_SEAT(S):${el}"></input>`;
                                detailList.appendChild(li);

                            }

                        });
                    }

                    const insertListItem = (item0, item1, item2, item3, childReference) => {

                        const allListItems = document.querySelectorAll('li');
                        let childRef = Array.from(allListItems).find(li => li.className.includes(`${childReference}`));

                        positionsData.forEach(el => {

                            if (item.includes(type) && providedData.indexOf(item) == positionsData.indexOf(el)) {

                                const li = document.createElement('li');
                                li.classList.add('detail', item1.toLowerCase() + '_' + item0, 'fi');
                                li.innerHTML = `<div class="label_${item1.toLowerCase().charAt(0)}"></div><small class="detail-type">${item1} seat x${item2}</small><div class="wrap"><div class="dot"></div><small class="total-item-price">
                                <strong>${formatMoney(item3 * item2)}</strong></small></div><input type="hidden" id="orderItem_${item1.toLowerCase().slice(0, 2)}" name="orderItem_${item1.toLowerCase().slice(0, 2)}" value="FLIGHT:${currentFlight}_TYPE:${item1}_NB:${item2}_TOT:${item3 * item2}_SEAT(S):${el}"></input>`;
                                detailList.insertBefore(li, childRef);

                            }

                        });
                    }

                    if (item.includes(type) && +lastTypeOfSeat.slice(-1) > lowestRank && getInterval(intArr) == null) {

                        appendListItem(item[0], item[1], item[2], item[3]);

                    } else if (item.includes(type) && +lastTypeOfSeat.slice(-1) < highestRank && getInterval(intArr) == null) {

                        insertListItem(item[0], item[1], item[2], item[3], highestRank);

                    } else if (item.includes(type) && +lastTypeOfSeat.slice(-1) < highestRank && getInterval(intArr) !== null) {

                        insertListItem(item[0], item[1], item[2], item[3], highestRank);

                    } else if (item.includes(type) && +lastTypeOfSeat.slice(-1) > lowestRank && getInterval(intArr) !== null) {

                        appendListItem(item[0], item[1], item[2], item[3]);

                    } else if (item.includes(type) && +lastTypeOfSeat.slice(-1) > highestRank && +lastTypeOfSeat.slice(-1) < lowestRank && getInterval(intArr) !== null) {

                        insertListItem(item[0], item[1], item[2], item[3], getInterval(intArr));

                    }

                });
            }

        } else if (currentTypesOfSeat.length < Array.from(detailListChildren).length) {

            let removedTypeOfSeat = detailListChildrenClasses.filter(el => !currentTypesOfSeat.includes(el));

            for (let type of removedTypeOfSeat) {

                Array.from(detailListChildren).forEach(child => {

                    if (cleanChildClassName(child.className) == type) {

                        let li = document.querySelector(`.${cleanChildClassName(child.className).replace(' ', '.')}`);
                        li.classList.toggle('fi');
                        li.classList.toggle('fo');
                        li.onanimationend = () => { detailList.removeChild(li); }

                    }

                });
            }
        }

        localStorage.setItem('detailContent', JSON.stringify(detailContainer.innerHTML));

    } else if (detailList && providedData.length == 0) {

        const detailTitle = document.querySelector('.detail-title');
        detailTitle.classList.toggle('fi');
        detailTitle.classList.toggle('fo');
        detailTitle.onanimationend = () => { detailContainer.removeChild(detailTitle); }

        detailList.classList.toggle('fo');
        detailList.onanimationend = () => { detailContainer.removeChild(detailList); }

        localStorage.removeItem('detailContent');

    }

}

// Get data from local storage and "populate" the user interface
function populateUI() {

    const selectedFlightIndex = localStorage.getItem('selectedFlightIndex');
    if (selectedFlightIndex !== null) {
        flightSelect.selectedIndex = selectedFlightIndex;
    } else {
        flightSelect.selectedIndex = 0;
    }

    const selectedFlight = localStorage.getItem('flightName');
    if (selectedFlight !== null) {
        currentFlight = selectedFlight;
    }

    const selectedFlightRates = JSON.parse(localStorage.getItem('selectedFlightRates'));
    if (selectedFlightRates !== null && selectedFlightRates.length > 0) {
        [preniumTicketPrice, legroomTicketPrice, frontTicketPrice, standardTicketPrice] = selectedFlightRates;
    }

    const newSeatsConfig = JSON.parse(localStorage.getItem('indexUnavailableSeats'));
    if (newSeatsConfig !== null) {
        allSeats.forEach((seat, index) => {
            if (index >= 0 && index <= 11) {
                seat.className = 'seat prenium';
            } else if (index >= 12 && index <= 23) {
                seat.className = 'seat legroom';
            } else if (index >= 24 && index <= 47) {
                seat.className = 'seat front';
            } else if (index >= 48 && index <= 95) {
                seat.className = 'seat standard';
            }

            if (newSeatsConfig.indexOf(index) > -1) {
                seat.className = 'seat unavailable';
            }
        });

        availableSeats = document.querySelectorAll('.row .seat:not(.unavailable)');
        unavailableSeats = document.querySelectorAll('.row .seat.unavailable');

    }

    const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
    if (selectedSeats !== null && selectedSeats.length > 0) {
        availableSeats.forEach((seat, index) => {
            if (selectedSeats.indexOf(index) > -1) {
                seat.classList.add('selected');
            }
        });
    }

    const seatsPositions = JSON.parse(localStorage.getItem('seatsPositions'));
    if (seatsPositions !== null && seatsPositions.length > 0) {
        currentSeatsPositions = seatsPositions;
    }

    const detailContent = JSON.parse(localStorage.getItem('detailContent'));
    if (detailContent !== null) {
        detailContainer.innerHTML = detailContent;
    }

}

// Filter initial data array to get flight rates based on selected flight
function getCurrentFlightRates(flightRatesIndex) {

    let filteredDataArr = data.filter(el => data.indexOf(el) === flightRatesIndex);
    let currentFlightRatesArr = [];

    filteredDataArr.forEach(el => {

        currentFlightRatesArr = [...currentFlightRatesArr, ...el];

    });

    return currentFlightRatesArr;

}

// Get total number of selected seats
function getNbOfSelectedSeats(arr) {

    let selectedSeatsArr = arr.filter(value => arr.indexOf(value) % 2 == 0);

    return selectedSeatsArr.reduce((acc, curr) => acc + curr);

}

// Show small error message under submit button (Book now)
function showOrderError(value) {

    orderContainer.className = 'order-container err';

    if (value == 0) {
        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>You must select at least one seat before submitting your order</span>';
    } else if (value > 8) {
        errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>You must be registered as a prenium or professional customer to book more than 8 seats</span>`;
    }

}

function checkOrderFormContent(value) {

    if (value > 0 && value <= 8) {
        confirmMsg.classList.add('show-message');
    } else {
        showOrderError(value);
    }
}

// Initial count and total set
updateSelectedCount();

// Initial showcase content
updateShowcaseContent();

// Login and register forms functions

// Show input error message for login and register forms
function showError(input, message) {

    const formControl = input.parentElement;
    formControl.className = 'form-control error';
    const small = formControl.querySelector('small');
    small.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;

}

// Show success outline for login and register forms
function showSuccess(input) {

    const formControl = input.parentElement;
    formControl.className = 'form-control success';
    const small = formControl.querySelector('small');
    small.innerHTML = `<i class="fas fa-check-circle"></i>`;

}

// Check email address for login and register forms
function checkEmail(email) {

    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (regex.test(email.value.trim())) {
        showSuccess(email);
    } else {
        showError(email, 'Email is not valid');
    }

}

// Ckeck required fields
function checkFields(inputArr) {

    inputArr.forEach((input, index) => {

        if (input.value.trim() === '') {

            showError(input, `${getFieldName(input)} is required`);

        } else if (index == 0) {
            // Username must be between 6 and 18 characters
            checkLength(input, 6, 18);

        } else if (index == 1) {
            // User password must be between 8 and 24 characters
            checkLength(input, 8, 24);

        } else {
            showSuccess(input);
        }
    });
}

// Check input length
function checkLength(input, min, max) {

    if (input.value.length < min) {

        showError(input, `${getFieldName(input)} must be at least ${min} characters`);

    } else if (input.value.length > max) {

        showError(input, `${getFieldName(input)} must be less than ${max} characters`);

    } else {

        showSuccess(input);
    }

}

// Get field name
function getFieldName(input) {

    let cleanFieldName = '';

    if (input.id === loginUsername.id || input.id === registerUsername.id) {

        cleanFieldName = input.id.charAt(4).toUpperCase() + input.id.slice(input.id.indexOf('s'));

    } else if (input.id === loginPassword.id || input.id === registerPassword.id) {

        cleanFieldName = input.id.charAt(4).toUpperCase() + input.id.slice(input.id.indexOf('a'));

    } else {

        cleanFieldName = input.id.charAt(0).toUpperCase() + input.id.slice(1);

    }

    return cleanFieldName;

}

// Check passwords match
function checkPasswords(input1, input2) {

    if (input1.value !== input2.value) {
        showError(input2, 'Passwords do not match');
    }

}


// Event Listeners main page

// Flight select event and ticket price attribution per type of seat - also reset seats map on flight change
flightSelect.addEventListener('change', (e) => {

    let flightRatesIndex = +e.target.value;
    let currentFlightRatesArr = getCurrentFlightRates(flightRatesIndex);
    currentFlight = formatFlightName(flightSelect.options[flightSelect.selectedIndex].text);

    // Destructuring
    [preniumTicketPrice, legroomTicketPrice, frontTicketPrice, standardTicketPrice] = currentFlightRatesArr;

    setFlightData(e.target.selectedIndex, currentFlight, currentFlightRatesArr);

    const shiftUnavailableSeatsIndex = () => {

        const shiftValuesMap = new Map();
        shiftValuesMap.set(flightSelect.options[0], 0);
        shiftValuesMap.set(flightSelect.options[1], 2);
        shiftValuesMap.set(flightSelect.options[2], 8);
        shiftValuesMap.set(flightSelect.options[3], 21);
        shiftValuesMap.set(flightSelect.options[4], 11);
        shiftValuesMap.set(flightSelect.options[5], 9);
        shiftValuesMap.set(flightSelect.options[6], 22);
        shiftValuesMap.set(flightSelect.options[7], 17);

        const indexUnavailableSeats = [...initIndexUnavailableSeats].map(index => {
            if (index + shiftValuesMap.get(flightSelect.options[flightSelect.selectedIndex]) > allSeats.length - 1)
                return index + shiftValuesMap.get(flightSelect.options[flightSelect.selectedIndex]) - allSeats.length;
            else return index + shiftValuesMap.get(flightSelect.options[flightSelect.selectedIndex]);
        });

        localStorage.setItem('indexUnavailableSeats', JSON.stringify(indexUnavailableSeats.sort((a, b) => a - b)));

        return indexUnavailableSeats.sort((a, b) => a - b);
    }

    const updateSeatsMap = () => {
        [...allSeats].map((seat, index) => {

            seat.classList.remove('selected');

            if (seat.className == 'seat unavailable') {
                seat.classList.remove('unavailable');
                if (index >= 0 && index <= 11) {
                    seat.classList.add('prenium');
                } else if (index >= 12 && index <= 23) {
                    seat.classList.add('legroom');
                } else if (index >= 24 && index <= 47) {
                    seat.classList.add('front');
                } else if (index >= 48 && index <= 95) {
                    seat.classList.add('standard');
                }
            }

            if ([...shiftUnavailableSeatsIndex()].indexOf(index) !== -1) {
                return seat.className = 'seat unavailable';
            }

        });

        availableSeats = document.querySelectorAll('.row .seat:not(.unavailable)');
        unavailableSeats = document.querySelectorAll('.row .seat.unavailable');

    }

    // Reset currentSeatsPositions array and remove seatsPositions item from local storage
    currentSeatsPositions = [];
    localStorage.removeItem('seatsPositions');

    updateSeatsMap();
    updateShowcaseContent();
    updateSelectedCount();
    updateDOM();

});

// Seat click event
seatMap.addEventListener('click', (e) => {

    if (e.target.classList.contains('seat') && !e.target.classList.contains('unavailable')) {

        e.target.classList.toggle('selected');

        updateSelectedCount();

        orderContainer.className = 'order-container';

        if (e.target.classList.contains('selected')) {

            currentSeatsPositions.push(e.target.textContent);
            currentSeatsPositions = Array.from(new Set(currentSeatsPositions));

        } else if (!e.target.classList.contains('selected') && !e.target.classList.contains('unavailable')) {

            currentSeatsPositions.splice(currentSeatsPositions.indexOf(e.target.textContent), 1);

        }

        updateDOM();

        localStorage.setItem('seatsPositions', JSON.stringify(currentSeatsPositions));

    }

});

// Event Listeners confirmation message

// Hide confirmation message
closeMsgBtn.addEventListener('click', () => confirmMsg.classList.remove('show-message'));

// Hide confirmation message on outside click
window.addEventListener('click', (e) => e.target == confirmMsg ? confirmMsg.classList.remove('show-message') : false);

orderForm.addEventListener('submit', (e) => {

    e.preventDefault();

    checkOrderFormContent(getNbOfSelectedSeats(currentSelectionArr));

    const formatOutputDetail = (str) => {
        return str.slice(0, str.indexOf(',')) + ' - ' + str.slice(15, str.indexOf(',', 9));
    }

    if (getNbOfSelectedSeats(currentSelectionArr) == 1) {
        detailOutput.innerText = `You booked seat ${currentSeatsPositions.sort().join(' ')} on flight ${formatOutputDetail(flightSelect.options[flightSelect.selectedIndex].text)} for a total amount of ${currentTotalAmount}$.`;
    } else if (getNbOfSelectedSeats(currentSelectionArr) > 1) {
        detailOutput.innerText = `You booked seats ${currentSeatsPositions.sort().join(' ')} on flight ${formatOutputDetail(flightSelect.options[flightSelect.selectedIndex].text)} for a total amount of ${currentTotalAmount}$.`;
    }

});

// Event Listeners login and register forms

// Show login form
logBtn.addEventListener('click', () => loginContainer.classList.add('show-login'));

// Hide login form
closeLoginBtn.addEventListener('click', () => loginContainer.classList.remove('show-login'));

// Hide login form on outside click
window.addEventListener('click', (e) => e.target == loginContainer ? loginContainer.classList.remove('show-login') : false);

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkFields([loginUsername, loginPassword]);
});

// Reset login form inputs
loginForm.reset();

// Show register form
registerBtn.addEventListener('click', () => registerContainer.classList.add('show-register'));

// Hide login form
closeRegisterBtn.addEventListener('click', () => registerContainer.classList.remove('show-register'));

// Hide login form on outside click
window.addEventListener('click', (e) => e.target == registerContainer ? registerContainer.classList.remove('show-register') : false);

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkFields([registerUsername, registerPassword, email, confPassword]);
    checkEmail(email);
    checkPasswords(registerPassword, confPassword);
});

// Reset register form inputs
registerForm.reset();

// Show project description
infoBtn.addEventListener('click', () => descriptionContainer.classList.add('show-description'));

// Hide project description
closeDescriptionBtn.addEventListener('click', () => descriptionContainer.classList.remove('show-description'));

// Hide project description on outside click
window.addEventListener('click', (e) => e.target == descriptionContainer ? descriptionContainer.classList.remove('show-description') : false);
