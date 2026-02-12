export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search resources..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "300px",
        padding: "10px",
        marginBottom: "20px",
      }}
    />
  );
}
