export function ProgressChart({
  data
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Прогресс</h3>
      {data.map((item) => (
        <div key={item.label} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>{item.label}</div>
          <div style={{ background: "#eee", borderRadius: 8, height: 10 }}>
            <div
              style={{
                width: `${Math.round((item.value / max) * 100)}%`,
                height: 10,
                borderRadius: 8,
                background: "#4f46e5"
              }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}

