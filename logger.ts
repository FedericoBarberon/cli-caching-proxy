import { blue, gray, red } from "@std/fmt/colors";

export enum LogLevel {
  DEBUG,
  INFO,
  ERROR,
}

let currentLevel = LogLevel.INFO;

export function setCurrentLevel(level: LogLevel) {
  currentLevel = level;
}

const levelText = {
  [LogLevel.INFO]: blue("[INFO]:"),
  [LogLevel.DEBUG]: gray("[DEBUG]:"),
  [LogLevel.ERROR]: red("[ERROR]:"),
};

export function log(logLevel: LogLevel, ...args: unknown[]) {
  if (logLevel < currentLevel) return;
  console.log(levelText[logLevel], ...args);
}
