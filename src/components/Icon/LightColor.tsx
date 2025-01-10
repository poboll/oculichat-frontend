const lightColor = "/assets/LightColor.png";

const LightColor = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%", // 父容器宽度
        height: "100%", // 父容器高度，可根据需要调整
      }}
    >
      <img style={{ width: 28 }} src={lightColor} alt={"浅色"} />
    </div>
  );
};
export default LightColor;
