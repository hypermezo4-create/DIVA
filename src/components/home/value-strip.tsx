type Value = {title: string; text: string};

export function ValueStrip({label, items}: {label: string; items: Value[]}) {
  return (
    <section className="value-strip" aria-label={label}>
      {items.map((item) => (
        <article key={item.title}>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
