import {
  Application,
  Controller,
} from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";
window.Stimulus = Application.start();

Stimulus.register(
  "countdown",
  class extends Controller {
    static targets = ["countdownOutput"];
    static values = {
      timer: String,
      countdownDate: Number,
      reversedTimer: { type: Boolean, default: false },
      isPaused: { type: Boolean, default: false },
      startPauseTime: Number,
      stopPauseTime: Number,
    };
    static classes = ["timerOn", "timerDone"];

    initialize() {
      const queryString = window.location.search;
      if (queryString.length) {
        const urlParams = new URLSearchParams(queryString);
        const time = urlParams.get("time").split("-");
        if (time.length >= 2) {
          time[1] = time[1] - 1;
        }
        const countdownDate = new Date(...time).getTime();
        this.countdownDateValue = countdownDate;
        this.updateTimer();
      } else {
        this.reversedTimerValue = true;
        const date = Date.now();
        this.countdownDateValue = date;
        this.updateTimer();
      }
    }

    connect() {
      this.startRefreshing();
    }

    disconnect() {
      this.stopRefreshing();
    }

    //updates timer shown to user
    timerValueChanged() {
      this.countdownOutputTarget.textContent = this.timerValue;
    }

    //updates timerValue
    updateTimer() {
      let timerInSeconds;
      if (!this.reversedTimerValue) {
        timerInSeconds = (this.countdownDateValue - Date.now()) / 1000;
      } else {
        timerInSeconds = (Date.now() - this.countdownDateValue) / 1000;
      }
      const days = Math.floor(timerInSeconds / 86400);
      timerInSeconds = timerInSeconds % 86400;
      const hours = Math.floor(timerInSeconds / 3600);
      timerInSeconds = timerInSeconds % 3600;
      const minutes = Math.floor(timerInSeconds / 60);
      timerInSeconds = timerInSeconds % 60;
      const seconds = Math.floor(timerInSeconds);
      const formattedTimer = `${days} D : ${hours} H : ${minutes} M : ${seconds} S`;
      this.timerValue = formattedTimer;
      if (timerInSeconds <= 0) {
        this.element.classList.add(this.timerDoneClass);
        this.element.classList.remove(this.timerOnClass);
        this.stopRefreshing();
      }
    }

    //starts refreshing intervals to keep timer up to date
    startRefreshing() {
      this.refreshTimer = setInterval(() => {
        this.updateTimer();
      }, 100);
    }

    //stops intervals if not needed anymore
    stopRefreshing() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }
    }

    //pauses and continues timer
    pause() {
      if (!this.isPausedValue) {
        this.startPauseTimeValue = Date.now();
        this.stopRefreshing();
        this.isPausedValue = true;
      } else {
        this.stopPauseTimeValue = Date.now();
        this.isPausedValue = false;
        const pauseTime = this.stopPauseTimeValue - this.startPauseTimeValue;
        this.countdownDateValue += pauseTime;
        this.startRefreshing();
      }
    }
  }
);
