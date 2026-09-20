/* =========================================================
   點餐系統
   純前端版本
   資料儲存在 localStorage
========================================================= */


/* ================= 基本資料 ================= */

const DAYS = ["週一", "週二", "週三", "週四", "週五"];

let selectedDay = getTodayDay();
let orderFilter = "全部";

let isAdmin = false;


/* ================= 預設資料 ================= */

let data = JSON.parse(
    localStorage.getItem("lunchSystemData")
) || {

    settings: {
        seatCount: 30,
        deadline: "12:00",
        password: "1234"
    },

    menu: {
        "週一": [],
        "週二": [],
        "週三": [],
        "週四": [],
        "週五": []
    },

    orders: []
};


/* ================= 初始化 ================= */

document.addEventListener("DOMContentLoaded", () => {

    saveData();

    setupSeats();

    updateTodayInfo();

    renderMeals();

    renderMenu();

    renderOrders();

    loadSettings();

    setupCSV();

});


/* ================= 儲存 ================= */

function saveData() {

    localStorage.setItem(
        "lunchSystemData",
        JSON.stringify(data)
    );

}


/* ================= 星期 ================= */

function getTodayDay() {

    const day = new Date().getDay();

    if (day >= 1 && day <= 5) {
        return DAYS[day - 1];
    }

    return "週一";
}


function getNextWorkDay() {

    const day = new Date().getDay();

    if (day === 5) {
        return "週一";
    }

    if (day === 6) {
        return "週一";
    }

    if (day === 0) {
        return "週一";
    }

    return DAYS[day];
}


/* ================= 座號 ================= */

function setupSeats() {

    const select = document.getElementById("seatSelect");

    select.innerHTML =
        `<option value="">請選擇座號</option>`;

    for (
        let i = 1;
        i <= data.settings.seatCount;
        i++
    ) {

        const option = document.createElement("option");

        option.value = i;
        option.textContent = `${i} 號`;

        select.appendChild(option);
    }

    select.addEventListener(
        "change",
        checkExistingOrder
    );
}


/* ================= 今日資訊 ================= */

function updateTodayInfo() {

    const today = getTodayDay();

    const info =
        document.getElementById("todayInfo");

    const deadline =
        document.getElementById("deadlineText");

    info.textContent =
        `今天：${today}`;

    deadline.textContent =
        data.settings.deadline;

    checkDeadline();

}


/* ================= 截止時間 ================= */

function checkDeadline() {

    const now = new Date();

    const [hour, minute] =
        data.settings.deadline
            .split(":")
            .map(Number);

    const deadline = new Date();

    deadline.setHours(
        hour,
        minute,
        0,
        0
    );

    const closed =
        now >= deadline;

    const message =
        document.getElementById(
            "closedMessage"
        );

    if (closed) {

        message.classList.remove(
            "hidden"
        );

    } else {

        message.classList.add(
            "hidden"
        );
    }

}


/* ================= 餐點 ================= */

function renderMeals() {

    const select =
        document.getElementById(
            "mealSelect"
        );

    const day = getTodayDay();

    const meals =
        data.menu[day] || [];

    select.innerHTML =
        `<option value="">請選擇餐點</option>`;

    meals.forEach(meal => {

        const option =
            document.createElement("option");

        option.value = meal.id;

        option.textContent =
            `${meal.name} $${meal.price}`;

        select.appendChild(option);

    });

}


/* ================= 檢查是否已點 ================= */

function checkExistingOrder() {

    const seat =
        document.getElementById(
            "seatSelect"
        ).value;

    const warning =
        document.getElementById(
            "existingOrderWarning"
        );

    if (!seat) {

        warning.classList.add("hidden");

        return;
    }

    const today =
        getTodayDay();

    const existing =
        data.orders.find(
            order =>
                order.day === today &&
                String(order.seat) === String(seat)
        );

    if (existing) {

        warning.classList.remove(
            "hidden"
        );

    } else {

        warning.classList.add(
            "hidden"
        );
    }

}


/* ================= 送出訂單 ================= */

function submitOrder() {

    const seat =
        document.getElementById(
            "seatSelect"
        ).value;

    const mealId =
        document.getElementById(
            "mealSelect"
        ).value;

    if (!seat) {

        alert("請選擇座號");

        return;
    }

    if (!mealId) {

        alert("請選擇餐點");

        return;
    }

    if (isDeadlinePassed()) {

        alert(
            "今日點餐已截止，請預訂下一個工作日。"
        );

        return;
    }


    const day =
        getTodayDay();

    const meal =
        data.menu[day].find(
            item =>
                String(item.id) ===
                String(mealId)
        );

    if (!meal) {

        alert("找不到餐點");

        return;
    }


    /* 同座號覆蓋 */

    data.orders =
        data.orders.filter(
            order =>
                !(
                    order.day === day &&
                    String(order.seat) ===
                    String(seat)
                )
        );


    data.orders.push({

        id: Date.now(),

        day: day,

        seat: Number(seat),

        mealId: meal.id,

        mealName: meal.name,

        price: Number(meal.price),

        time:
            new Date().toLocaleString(
                "zh-TW"
            )

    });


    saveData();

    document.getElementById(
        "successText"
    ).textContent =
        `${day}｜${seat} 號｜${meal.name}`;

    document.getElementById(
        "successModal"
    ).classList.remove("hidden");

    checkExistingOrder();

}


/* ================= 判斷截止 ================= */

function isDeadlinePassed() {

    const now = new Date();

    const [hour, minute] =
        data.settings.deadline
            .split(":")
            .map(Number);

    const deadline = new Date();

    deadline.setHours(
        hour,
        minute,
        0,
        0
    );

    return now >= deadline;
}


/* ================= 關閉成功 ================= */

function closeSuccess() {

    document.getElementById(
        "successModal"
    ).classList.add("hidden");

}


/* =========================================================
   管理端
========================================================= */


/* ================= 登入 ================= */

function openAdminLogin() {

    document.getElementById(
        "loginModal"
    ).classList.remove("hidden");

    document.getElementById(
        "adminPassword"
    ).value = "";

}


function closeLogin() {

    document.getElementById(
        "loginModal"
    ).classList.add("hidden");

}


function loginAdmin() {

    const password =
        document.getElementById(
            "adminPassword"
        ).value;

    const error =
        document.getElementById(
            "loginError"
        );

    if (
        password ===
        data.settings.password
    ) {

        isAdmin = true;

        closeLogin();

        document.getElementById(
            "orderPage"
        ).classList.add("hidden");

        document.getElementById(
            "adminPage"
        ).classList.remove("hidden");

        renderMenu();

        renderOrders();

    } else {

        error.textContent =
            "密碼錯誤，請重試。";

    }

}


/* ================= 登出 ================= */

function logoutAdmin() {

    isAdmin = false;

    document.getElementById(
        "adminPage"
    ).classList.add("hidden");

    document.getElementById(
        "orderPage"
    ).classList.remove("hidden");

}


/* ================= 管理分頁 ================= */

function showAdminSection(id) {

    document
        .querySelectorAll(".admin-section")
        .forEach(section => {

            section.classList.add(
                "hidden"
            );

        });

    document
        .getElementById(id)
        .classList.remove("hidden");

}


/* =========================================================
   菜單管理
========================================================= */


/* ================= 選擇星期 ================= */

function selectDay(day) {

    selectedDay = day;

    document
        .querySelectorAll(".day-btn")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

            if (
                button.textContent === day
            ) {

                button.classList.add(
                    "active"
                );

            }

        });

    renderMenu();

}


/* ================= 顯示菜單 ================= */

function renderMenu() {

    const list =
        document.getElementById(
            "menuList"
        );

    if (!list) return;

    const meals =
        data.menu[selectedDay] || [];

    list.innerHTML = "";

    if (meals.length === 0) {

        list.innerHTML =
            `<div class="warning">
                該日尚無餐點，請上傳 CSV 或手動新增。
            </div>`;

    }


    meals.forEach(meal => {

        const item =
            document.createElement("div");

        item.className =
            "menu-item";

        item.innerHTML = `

            <div>
                <span class="menu-name">
                    ${escapeHTML(meal.name)}
                </span>

                <span class="menu-price">
                    $${meal.price}
                </span>
            </div>

            <button
                class="delete-btn"
                onclick="deleteMeal('${meal.id}')"
            >
                🗑️ 刪除
            </button>
        `;

        list.appendChild(item);

    });


    updateStatistics();

}


/* ================= 新增餐點 ================= */

function openAddMeal() {

    document.getElementById(
        "newMealName"
    ).value = "";

    document.getElementById(
        "newMealPrice"
    ).value = "";

    document.getElementById(
        "mealModal"
    ).classList.remove("hidden");

}


function closeMealModal() {

    document.getElementById(
        "mealModal"
    ).classList.add("hidden");

}


function addMeal() {

    const name =
        document.getElementById(
            "newMealName"
        ).value.trim();

    const price =
        Number(
            document.getElementById(
                "newMealPrice"
            ).value
        );

    if (!name) {

        alert("請輸入餐點名稱");

        return;
    }

    if (
        !price ||
        price < 0
    ) {

        alert("請輸入正確價格");

        return;
    }


    data.menu[selectedDay].push({

        id:
            Date.now().toString(),

        name: name,

        price: price

    });


    saveData();

    closeMealModal();

    renderMenu();

    renderMeals();

}


/* ================= 刪除餐點 ================= */

function deleteMeal(id) {

    if (
        !confirm(
            "確定要刪除這個餐點嗎？"
        )
    ) return;

    data.menu[selectedDay] =
        data.menu[selectedDay]
            .filter(
                meal =>
                    String(meal.id) !==
                    String(id)
            );

    saveData();

    renderMenu();

    renderMeals();

}


/* =========================================================
   CSV
========================================================= */

function setupCSV() {

    const zone =
        document.getElementById(
            "dropZone"
        );

    const input =
        document.getElementById(
            "csvFile"
        );

    zone.addEventListener(
        "click",
        () => input.click()
    );


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];

            if (file) {
                readCSV(file);
            }

        }
    );


    zone.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            zone.classList.add(
                "dragover"
            );

        }
    );


    zone.addEventListener(
        "dragleave",
        () => {

            zone.classList.remove(
                "dragover"
            );

        }
    );


    zone.addEventListener(
        "drop",
        event => {

            event.preventDefault();

            zone.classList.remove(
                "dragover"
            );

            const file =
                event.dataTransfer.files[0];

            if (
                file &&
                file.name
                    .toLowerCase()
                    .endsWith(".csv")
            ) {

                readCSV(file);

            }

        }
    );

}


/* ================= 讀取 CSV ================= */

function readCSV(file) {

    const reader =
        new FileReader();

    reader.onload = event => {

        const text =
            event.target.result
                .replace(/^\uFEFF/, "");

        const lines =
            text
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean);


        let imported = 0;


        lines.forEach((line, index) => {

            const parts =
                line.split(",");

            if (parts.length < 3) {
                return;
            }


            let day =
                normalizeDay(
                    parts[0].trim()
                );

            const name =
                parts[1].trim();

            const price =
                Number(
                    parts[2].trim()
                );


            /* 略過標題 */

            if (
                index === 0 &&
                (
                    parts[0]
                        .includes("星期") ||
                    parts[1]
                        .includes("餐點")
                )
            ) {
                return;
            }


            if (
                !day ||
                !name ||
                isNaN(price)
            ) {
                return;
            }


            data.menu[day].push({

                id:
                    Date.now() +
                    Math.random(),

                name: name,

                price: price

            });


            imported++;

        });


        saveData();

        renderMenu();

        renderMeals();

        alert(
            `成功匯入 ${imported} 筆餐點！`
        );

    };

    reader.readAsText(
        file,
        "UTF-8"
    );

}


/* ================= 星期格式 ================= */

function normalizeDay(value) {

    const map = {

        "週一": "週一",
        "星期一": "週一",
        "1": "週一",
        "Monday": "週一",
        "Mon": "週一",

        "週二": "週二",
        "星期二": "週二",
        "2": "週二",
        "Tuesday": "週二",
        "Tue": "週二",

        "週三": "週三",
        "星期三": "週三",
        "3": "週三",
        "Wednesday": "週三",
        "Wed": "週三",

        "週四": "週四",
        "星期四": "週四",
        "4": "週四",
        "Thursday": "週四",
        "Thu": "週四",

        "週五": "週五",
        "星期五": "週五",
        "5": "週五",
        "Friday": "週五",
        "Fri": "週五"

    };

    return map[value] || null;

}


/* =========================================================
   統計
========================================================= */

function updateStatistics() {

    const meals =
        data.menu[selectedDay] || [];

    const orders =
        data.orders.filter(
            order =>
                order.day === selectedDay
        );


    document.getElementById(
        "mealCount"
    ).textContent =
        meals.length;


    document.getElementById(
        "orderCount"
    ).textContent =
        orders.length;


    const revenue =
        orders.reduce(
            (sum, order) =>
                sum + Number(order.price),
            0
        );


    document.getElementById(
        "revenue"
    ).textContent =
        revenue;

}


/* =========================================================
   訂單
========================================================= */

function filterOrders(day) {

    orderFilter = day;

    renderOrders();

}


function renderOrders() {

    const list =
        document.getElementById(
            "orderList"
        );

    if (!list) return;

    let orders =
        [...data.orders];


    if (
        orderFilter !== "全部"
    ) {

        orders =
            orders.filter(
                order =>
                    order.day ===
                    orderFilter
            );

    }


    orders.sort(
        (a, b) =>
            a.seat - b.seat
    );


    list.innerHTML = "";


    if (orders.length === 0) {

        list.innerHTML =
            `<div class="warning">
                目前尚無訂單。
            </div>`;

    }


    orders.forEach(order => {

        const item =
            document.createElement("div");

        item.className =
            "order-card";

        item.innerHTML = `

            <div>
                <div class="order-seat">
                    ${order.day}｜${order.seat} 號
                </div>

                <div class="order-meal">
                    ${escapeHTML(order.mealName)}
                </div>
            </div>

            <div class="order-price">
                $${order.price}
            </div>

        `;

        list.appendChild(item);

    });


    renderMealStatistics();

    updateStatistics();

}


/* ================= 餐點統計 ================= */

function renderMealStatistics() {

    const container =
        document.getElementById(
            "mealStatistics"
        );

    if (!container) return;

    const statistics = {};


    data.orders.forEach(order => {

        const key =
            `${order.day}-${order.mealName}`;

        if (!statistics[key]) {

            statistics[key] = {

                day: order.day,

                meal: order.mealName,

                count: 0,

                seats: []

            };

        }

        statistics[key].count++;

        statistics[key].seats.push(
            order.seat
        );

    });


    container.innerHTML = "";


    Object.values(statistics)
        .sort((a, b) =>
            DAYS.indexOf(a.day) -
            DAYS.indexOf(b.day)
        )
        .forEach(item => {

            const div =
                document.createElement("div");

            div.className =
                "stat-item";

            div.innerHTML = `

                <strong>
                    ${item.day}｜${escapeHTML(item.meal)}
                </strong>

                <div>
                    ${item.count} 份
                </div>

                <small>
                    座號：
                    ${item.seats.join("、")}
                </small>

            `;

            container.appendChild(div);

        });


    if (
        Object.keys(statistics)
            .length === 0
    ) {

        container.innerHTML =
            `<div class="warning">
                目前尚無統計資料。
            </div>`;

    }

}


/* =========================================================
   CSV 匯出
========================================================= */

function exportCSV() {

    if (data.orders.length === 0) {

        alert("目前沒有訂單");

        return;
    }


    let csv =
        "星期,座號,餐點名稱,價格,時間\n";


    data.orders.forEach(order => {

        csv +=
            `${order.day},${order.seat},"${order.mealName}",${order.price},"${order.time}"\n`;

    });


    downloadFile(
        csv,
        "點餐訂單.csv",
        "text/csv;charset=utf-8;"
    );

}


/* ================= 下載檔案 ================= */

function downloadFile(
    content,
    filename,
    type
) {

    const blob =
        new Blob(
            ["\uFEFF" + content],
            { type: type }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);

}


/* =========================================================
   回報
========================================================= */

function generateReport() {

    let report =
        "🍱 點餐訂單回報\n\n";


    DAYS.forEach(day => {

        const orders =
            data.orders.filter(
                order =>
                    order.day === day
            );

        if (orders.length === 0) {
            return;
        }


        report +=
            `【${day}】\n`;


        orders
            .sort(
                (a, b) =>
                    a.seat - b.seat
            )
            .forEach(order => {

                report +=
                    `${order.seat}號｜${order.mealName}｜$${order.price}\n`;

            });


        report += "\n";

    });


    if (
        data.orders.length === 0
    ) {

        report +=
            "目前尚無訂單。";

    }


    document.getElementById(
        "reportText"
    ).value = report;

    document.getElementById(
        "reportModal"
    ).classList.remove("hidden");

}


function closeReport() {

    document.getElementById(
        "reportModal"
    ).classList.add("hidden");

}


function copyReport() {

    const text =
        document.getElementById(
            "reportText"
        ).value;

    navigator.clipboard
        .writeText(text)
        .then(() => {

            alert(
                "已複製訂單回報內容！"
            );

        });

}


/* =========================================================
   設定
========================================================= */

function loadSettings() {

    document.getElementById(
        "seatCount"
    ).value =
        data.settings.seatCount;


    document.getElementById(
        "deadlineInput"
    ).value =
        data.settings.deadline;

}


function saveSettings() {

    const seatCount =
        Number(
            document.getElementById(
                "seatCount"
            ).value
        );

    const deadline =
        document.getElementById(
            "deadlineInput"
        ).value;


    if (
        !seatCount ||
        seatCount < 1
    ) {

        alert(
            "請輸入正確的座位數量"
        );

        return;
    }


    data.settings.seatCount =
        seatCount;

    data.settings.deadline =
        deadline || "12:00";


    saveData();

    setupSeats();

    updateTodayInfo();


    document.getElementById(
        "saveMessage"
    ).textContent =
        "✅ 設定已儲存成功！";


    setTimeout(() => {

        document.getElementById(
            "saveMessage"
        ).textContent = "";

    }, 2500);

}


/* ================= 更改密碼 ================= */

function changePassword() {

    const password =
        document.getElementById(
            "newPassword"
        ).value.trim();


    if (!password) {

        alert("請輸入新密碼");

        return;
    }


    data.settings.password =
        password;

    saveData();


    document.getElementById(
        "newPassword"
    ).value = "";


    alert(
        "管理密碼已更新！"
    );

}


/* =========================================================
   資料管理
========================================================= */

function clearSelectedOrders() {

    if (
        !confirm(
            `確定要清除 ${selectedDay} 的所有訂單嗎？`
        )
    ) return;


    data.orders =
        data.orders.filter(
            order =>
                order.day !==
                selectedDay
        );


    saveData();

    renderOrders();

    updateStatistics();

}


function clearAllMenu() {

    if (
        !confirm(
            "確定要清除整個星期的菜單嗎？"
        )
    ) return;


    DAYS.forEach(day => {

        data.menu[day] = [];

    });


    saveData();

    renderMenu();

    renderMeals();

}


function resetAll() {

    if (
        !confirm(
            "這會刪除所有菜單、訂單與設定，確定嗎？"
        )
    ) return;


    localStorage.removeItem(
        "lunchSystemData"
    );

    location.reload();

}


/* =========================================================
   工具
========================================================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
