export function StreakDisplay({ streak }: { streak: number }) {
  return (
    <div style={{ fontWeight: 700 }}>
      🔥 {streak} дн.
    </div>
  );
}

