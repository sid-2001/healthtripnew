// bot.ts
import TelegramBot from "node-telegram-bot-api";
import User from "../models/user";
import api_keys from "../models/api";
import axios from "axios";
import { Channel } from "diagnostics_channel";

const token = "7016543735:AAH9ZjCoxfcIS7Q52-2V5f2anrqLSpy56lo";
const bot = new TelegramBot(token, { polling: true });

interface Coord {
  lon: number;
  lat: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level: number;
  grnd_level: number;
}

interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

interface Clouds {
  all: number;
}

interface Sys {
  country: string;
  sunrise: number;
  sunset: number;
}

interface WeatherData {
  coord: Coord;
  weather: Weather[];
  base: string;
  main: Main;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

enum Channeltype {
  weather = "Weather",
}
// Function to send weather update to users
export async function sendWeatherUpdate(
  chatId: number,
  city: string,
  country: string,
  key: string
) {
  try {
    const apiKey = key;
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`;
    const response = await axios.get(apiUrl);
    const weatherData: WeatherData = response.data;

    const weatherMessage =
      `Weather update for ${city}, ${country}:\n` +
      `Temperature: ${weatherData.main.temp}°C\n` +
      `Description: ${weatherData.weather[0].description}\n` +
      `Humidity: ${weatherData.main.humidity}%`;

    bot.sendMessage(chatId, weatherMessage);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    bot.sendMessage(chatId, "Failed to fetch weather data.");
  }
}

// Function to send weather update to all users
async function sendWeatherUpdateToAllUsers() {
  try {
    const users = await User.find({ blocked: false });

    let all_Data = await api_keys.find();

    let data: any = await api_keys.findOne({
      channel: Channeltype.weather,
    });

    let result = JSON.parse(JSON.stringify(data));

    console.log(result.key);
    for (const user of users) {
      await sendWeatherUpdate(
        user.sender_id,
        user.city,
        user.country,
        result.key
      );
    }
  } catch (error) {
    console.error("Error sending weather updates to users:", error);
  }
}

// Send weather update to users daily

// setInterval(sendWeatherUpdateToAllUsers, 10000);

// Handle user messages

interface TeleMessage {
  message_id: Number;
  from: {
    id: Number;
    is_bot: Boolean;
    first_name: String;
    last_name: String;
    language_code: String;
  };
  chat: {
    id: Number;
    first_name: String;
    last_name: String;
    type: String;
  };
  date: Number;
  text: String;
}
bot.on("message", async (msg: any): Promise<any> => {
  let message: TeleMessage = msg;
  let chatId = message.from.id;
  let user = await User.findOne({ sender_id: chatId });

  if (!user) {
    // New user registration
    const newUser = new User();
    newUser.sender_id = chatId as number;
    (newUser.first_name = String(message.from.first_name)),
      (newUser.last_name = String(message.from.last_name)),
      await newUser.save();

    bot.sendMessage(chatId as any, "Welcome! Please enter your city:");
  } else if (!user.city) {
    await User.findOneAndUpdate({ sender_id: chatId }, { city: msg.text });
    bot.sendMessage(chatId as any, "Please enter your country:");
  } else if (!user.country) {
    user.country = msg.text;
    user.save();
    bot.sendMessage(
      chatId as any,
      "Registration complete! You will receive daily weather updates."
    );
  } else {
    // User already registered
    if (user.blocked) {
      bot.sendMessage(
        chatId as number,
        "Sorry You have been Blocked by Admin For Recieving any Notification"
      );
    } else {
      bot.sendMessage(
        chatId as number,
        "Welcome back! You are already registered for weather updates."
      );
    }
  }
});

// Handle user blocking
bot.onText(/\/block/, async (msg) => {
  let message: TeleMessage = msg as any;
  const chatId = message.from.id;
  const user = await User.findOne({ sender_id: chatId });

  if (user) {
    user.blocked = true;
    // await user.save();
    await user.deleteOne();
    bot.sendMessage(
      chatId as any,
      "You have been blocked from receiving weather updates."
    );
  } else {
    bot.sendMessage(chatId as any, "You are not registered yet.");
  }
});
