const svgClass = "h-16 w-auto sm:h-auto";

export function SudokuThumb() {
  return (
    <svg aria-hidden="true" className={svgClass} width="112" height="112" viewBox="0 0 90 90" fill="none" stroke="#16233F">
      <rect x="2" y="2" width="86" height="86" rx="4" strokeWidth="3" fill="#FFF8E6" />
      <path d="M31 2v86M59 2v86M2 31h86M2 59h86" strokeWidth="2.5" />
      <g fontFamily="Bricolage Grotesque, sans-serif" fontWeight="800" fontSize="18" fill="#16233F" stroke="none" textAnchor="middle">
        <text x="16" y="23">5</text>
        <text x="45" y="52">9</text>
        <text x="74" y="81">3</text>
        <text x="74" y="23">1</text>
        <text x="16" y="81">7</text>
      </g>
    </svg>
  );
}

export function SnakeThumb() {
  return (
    <svg aria-hidden="true" className={svgClass} width="140" height="100" viewBox="0 0 140 100" fill="none">
      <path d="M14 80h44V50h40V22h28" stroke="#0E2A1E" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="126" cy="22" r="3" fill="#FFFFFF" />
      <rect x="104" y="68" width="14" height="14" rx="4" fill="#FFE27A" />
    </svg>
  );
}

export function SlideThumb() {
  const tiles: Array<[number, number, string]> = [
    [3, 3, "1"], [32, 3, "2"], [61, 3, "3"],
    [3, 32, "4"], [61, 32, "5"],
    [3, 61, "6"], [32, 61, "8"], [61, 61, "7"],
  ];
  return (
    <svg aria-hidden="true" className={svgClass} width="112" height="112" viewBox="0 0 90 90">
      <g fill="#FFF1F1" stroke="#3A0F12" strokeWidth="2.5">
        {tiles.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="26" height="26" rx="5" />
        ))}
      </g>
      <g fontFamily="Bricolage Grotesque, sans-serif" fontWeight="800" fontSize="15" fill="#3A0F12" textAnchor="middle">
        {tiles.map(([x, y, label]) => (
          <text key={label} x={x + 13} y={y + 18}>{label}</text>
        ))}
      </g>
    </svg>
  );
}

export function TetrisThumb() {
  const squares = (cells: Array<[number, number]>) =>
    cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="20" height="20" />);
  return (
    <svg aria-hidden="true" className={svgClass} width="120" height="110" viewBox="0 0 120 110" stroke="#0B2A3A" strokeWidth="2.5">
      <g fill="#FFE27A">{squares([[10, 80], [30, 80], [50, 80], [30, 60]])}</g>
      <g fill="#FFFFFF">{squares([[70, 80], [90, 80], [90, 60], [90, 40]])}</g>
      <g fill="#16233F">{squares([[40, 10], [60, 10], [40, 30], [60, 30]])}</g>
    </svg>
  );
}
