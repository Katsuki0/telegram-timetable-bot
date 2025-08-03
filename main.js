const TelegramBot = require('node-telegram-bot-api'); // основная библиотека.
//const { Markup } = require('telegraf'); // Кнопки.
const fs = require('fs'); // чтение файлов
const sqlite = require('sqlite-sync'); // База данных.
const schedule = require('node-schedule'); // Для расписаний

const bot = new TelegramBot('TOKEN', { polling: true }); // Подключение к боту, polling - short polling - частота опроса Telegram.


sqlite.connect('data.db'); // Открытие sqlite3 бд, если нет, то создает.

let awaitingSupportMessage = {}; // Хранение информации о пользователях, ожидающих поддержки
// Хранение выбранных тем для пользователей

//bot.onText(/\/start/, (msg) => {
  //const chatId = msg.chat.id;
  //bot.sendMessage(chatId, "Привет!");
//});

bot.onText("🗝️ | Вернуться", (msg) => {
  auth(msg);
});

// Функция Стартового меню.
function startmenu(msg) {
    const firstName = msg.from.first_name;
    const lastName = msg.from.last_name;
    const nickname = msg.from.username;
      bot.sendMessage(msg.chat.id, `Добро пожаловать, ${firstName} ${lastName} (@${nickname}). \n\nДля Авторизации или получения информации нажмите соответствующие кнопки снизу.`, {
        "reply_markup": { // Создание кнопок снизу.
        "keyboard": [["🔑 | Авторизация", "📖 | Информация"]] // Те самые кнопки.
    }
});
}

function auth(msg) {
    const userId = msg.from.id;
    var rows = sqlite.run(`SELECT * FROM users WHERE t_id = ${userId}`);
    var tid = rows[0].t_id;
    var logged = rows[0].logged_in;
    if (userId == tid) {
        sqlite.run(`UPDATE users SET logged_in=1 WHERE t_id = ${userId}`);
        if (logged == 1) {
            bot.sendMessage(msg.chat.id, `Здраствуйте, \n\n Ваш ID в системе: ${rows[0].id}\n Ваш Telegram ID: ${rows[0].t_id}\n Имя и Фамилия: ${rows[0].name} ${rows[0].surname}\n\n Администратор ли вы: ${rows[0].isAdmin}`, {
            "reply_markup": {
            "keyboard": [["⏰ | Создать напоминание","👷 | Добавить/Удалить сотрудника"], ["Выйти"]]
        },
        });
        }
    } else {
       bot.sendMessage(msg.chat.id, "У вас нет доступа!");
    }
}


// Стартового меню.
bot.onText(/\/start/, (msg) => {
    startmenu(msg);
});

// Блок информации.
bot.onText("📖 | Информация", (msg) => {

    bot.sendMessage(msg.chat.id, "Тут информация.");

});

// Авторизация - меню.
bot.onText("🔑 | Авторизация", (msg) => {
    auth(msg);
});

// Создание и удаление пользователей.

bot.onText('👷 | Добавить/Удалить сотрудника', (msg) => {
    const userId = msg.from.id;
    var rows = sqlite.run(`SELECT * FROM users WHERE t_id = ${userId}`);
    var logged = rows[0].logged_in;
    if (logged == 1) {
        bot.sendMessage(msg.chat.id, "Выберите что нужно сделать.", {
            "reply_markup": {
            "keyboard": [["Добавить сотрудника", "Удалить сотрудника"], ["🗝️ | Вернуться"]]
            },
        });
    } else {
        bot.sendMessage(msg.chat.id, "Для начала войдите!");
    }
});

bot.onText("Добавить сотрудника", (msg) => {
   
    bot.sendMessage(chatId, "Введите Telegram ID, Имя, Фамилию через пробел:");

});

//bot.onText("Удалить сотрудника", (msg) => {
    //auth(msg);
//});

// Создать напоминание

bot.onText('⏰ | Создать напоминание', (msg) => {
    if (logged_in == 1) {
        bot.sendMessage(msg.chat.id, "Выберите кому создать напоминание.", {
            "reply_markup": {
            "keyboard": [["Сотруднику", "Группе Сотрудников"], ["🗝️ | Вернуться"]]
            },
        });
    } else {
        bot.sendMessage(msg.chat.id, "Для начала войдите!");
    }
});

// Выход

bot.onText("Выйти", (msg) => {
    const userId = msg.from.id;
    sqlite.run(`UPDATE users SET logged_in=1 WHERE t_id = ${userId}`);
    bot.sendMessage(msg.chat.id, "Вы успешно вышли.");
    startmenu(msg);
});

bot.on('polling_error', (error) => {
  console.log(`[polling_error] ${error.code}: ${error.message}`);
});


console.log('Бот запущен.');