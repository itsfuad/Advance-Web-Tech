#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$ROOT_DIR/.run"
BACK_PID_FILE="$RUN_DIR/backend.pid"
FRONT_PID_FILE="$RUN_DIR/frontend.pid"
BACK_LOG="$RUN_DIR/backend.log"
FRONT_LOG="$RUN_DIR/frontend.log"

mkdir -p "$RUN_DIR"

is_running() {
  local pid="$1"
  kill -0 "$pid" >/dev/null 2>&1
}

start_servers() {
  if [[ -f "$BACK_PID_FILE" ]] && is_running "$(cat "$BACK_PID_FILE")"; then
    echo "Backend already running (PID $(cat "$BACK_PID_FILE"))."
  else
    (
      cd "$ROOT_DIR/backend"
      nohup npm run start:dev >"$BACK_LOG" 2>&1 &
      echo $! >"$BACK_PID_FILE"
    )
    echo "Started backend (PID $(cat "$BACK_PID_FILE"))."
  fi

  if [[ -f "$FRONT_PID_FILE" ]] && is_running "$(cat "$FRONT_PID_FILE")"; then
    echo "Frontend already running (PID $(cat "$FRONT_PID_FILE"))."
  else
    (
      cd "$ROOT_DIR/frontend"
      nohup npm run dev >"$FRONT_LOG" 2>&1 &
      echo $! >"$FRONT_PID_FILE"
    )
    echo "Started frontend (PID $(cat "$FRONT_PID_FILE"))."
  fi

  echo "Logs:"
  echo "  Backend:  $BACK_LOG"
  echo "  Frontend: $FRONT_LOG"
}

stop_one() {
  local name="$1"
  local pid_file="$2"
  if [[ ! -f "$pid_file" ]]; then
    echo "$name is not running."
    return
  fi

  local pid
  pid="$(cat "$pid_file")"

  if is_running "$pid"; then
    kill "$pid" >/dev/null 2>&1 || true
    sleep 1
    if is_running "$pid"; then
      kill -9 "$pid" >/dev/null 2>&1 || true
    fi
    echo "Stopped $name (PID $pid)."
  else
    echo "$name PID file found, but process is not running."
  fi

  rm -f "$pid_file"
}

status_one() {
  local name="$1"
  local pid_file="$2"
  if [[ -f "$pid_file" ]] && is_running "$(cat "$pid_file")"; then
    echo "$name: running (PID $(cat "$pid_file"))"
  else
    echo "$name: stopped"
  fi
}

case "${1:-start}" in
  start)
    start_servers
    ;;
  stop)
    stop_one "Backend" "$BACK_PID_FILE"
    stop_one "Frontend" "$FRONT_PID_FILE"
    ;;
  status)
    status_one "Backend" "$BACK_PID_FILE"
    status_one "Frontend" "$FRONT_PID_FILE"
    ;;
  *)
    echo "Usage: ./run.sh [start|stop|status]"
    exit 1
    ;;
esac
