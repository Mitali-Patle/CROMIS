export function generateTimeSlots(start, end, step = 15) {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  while (h < endH || (h === endH && m < endM)) {
<<<<<<< HEAD
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
=======
    slots.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
    m += step;
    if (m >= 60) {
      h++;
      m = 0;
    }
  }
  return slots;
}

export function isOverlapping(start, end, bookedSlots) {
<<<<<<< HEAD
  return bookedSlots.some((b) => start < b.endTime && end > b.startTime);
=======
  return bookedSlots.some(
    (b) => start < b.endTime && end > b.startTime
  );
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
}
