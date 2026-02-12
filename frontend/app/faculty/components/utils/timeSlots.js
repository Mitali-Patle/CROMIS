export function generateTimeSlots(start, end, step = 15) {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += step;
    if (m >= 60) {
      h++;
      m = 0;
    }
  }
  return slots;
}

export function isOverlapping(start, end, bookedSlots) {
  return bookedSlots.some((b) => start < b.endTime && end > b.startTime);
}
