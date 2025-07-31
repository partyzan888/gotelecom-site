// Файл: /api/telegram-sender.js

export default async function handler(request, response) {
  // 1. Проверяем, что это POST-запрос
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Получаем секретные данные из переменных окружения
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return response.status(500).json({ error: 'Переменные окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID должны быть установлены' });
  }

  try {
    // 3. Получаем текст сообщения из тела запроса от фронтенда
    const { message } = request.body;
    if (!message) {
      return response.status(400).json({ error: 'Отсутствует поле "message" в запросе' });
    }

    // 4. Формируем URL для запроса к Telegram API
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    // 5. Отправляем сообщение в Telegram
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown', // Используем Markdown для красивого форматирования
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      // Если Telegram вернул ошибку
      throw new Error(telegramResult.description);
    }

    // 6. Отправляем успешный ответ обратно на фронтенд
    return response.status(200).json({ success: true });

  } catch (error) {
    // 7. В случае ошибки отправляем сообщение об ошибке
    console.error('Telegram API Error:', error.message);
    return response.status(500).json({ error: `Ошибка при отправке в Telegram: ${error.message}` });
  }
}