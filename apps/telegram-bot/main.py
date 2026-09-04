import telebot
from telebot import types
import os
import logging
from datetime import datetime

# Configurações V96.2 (Audit Mode)
API_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8660701723:AAEP3H5a66EADhKxmeMKuoxgcL_IX92R9To")

# Logs Simplificados (Python 3.6 compat)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

bot = telebot.TeleBot(API_TOKEN)

# --- Keyboards ---

def main_menu():
    m = types.InlineKeyboardMarkup()
    m.add(types.InlineKeyboardButton("🎓 ALUNA", callback_data="aluna"))
    m.add(types.InlineKeyboardButton("💼 LICENCIADA", callback_data="licenciada"))
    m.add(types.InlineKeyboardButton("🩺 CLÍNICO", callback_data="clinico"))
    return m

# --- Handlers ---

@bot.message_handler(commands=['start'])
def send_welcome(message):
    logger.info("START recebido")
    bot.send_message(message.chat.id, "Menu Body Harmony (V3.8.3):", reply_markup=main_menu())

@bot.callback_query_handler(func=lambda call: True)
def callback_handler(call):
    logger.info("CLICK detectado: " + str(call.data))
    
    # Resposta obrigatória e imediata
    try:
        bot.answer_callback_query(call.id)
    except:
        pass

    if call.data == "aluna":
        bot.send_message(call.message.chat.id, "Área da aluna: https://bodyharmony.com.br/login")
    elif call.data == "clinico":
        bot.send_message(call.message.chat.id, "Suporte Clínico: Equipe notificada.")

if __name__ == '__main__':
    logger.info("Bot Estabilizado v3.8.3 Iniciando...")
    bot.remove_webhook()
    # Polling mais lento para evitar kill do Hostinger (SIGKILL 137)
    bot.polling(none_stop=True, interval=3, timeout=60)
