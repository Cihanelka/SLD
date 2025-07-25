const lineStyle = {
  width: 100,
  height: 4,
  background: '#333',
  borderRadius: 2,
  margin: 0,
  position: 'relative',
  boxSizing: 'border-box',
};
const Busbar = ({ width = 100, height = 20 }) => {
return (
    <div data-cell-shape="body" style={{ position: 'absolute', top: 0, left: 0, width, height, cursor: 'move' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 12,
          cursor: 'move',
          zIndex: 10,
          pointerEvents: 'auto',
        }}
        onMouseDown={e => {
          e.stopPropagation();
        } }
      />
      <div
        style={{
          ...lineStyle,
          width,
          height: 4,
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)'
        }}
      />
    </div>
  );
};

export default Busbar;
