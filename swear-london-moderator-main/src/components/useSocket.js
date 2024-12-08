export default function useSocket() {
    const setupSocket = (shoes, ordersCount) => {
      const primus = new Primus("https://sneaker-api-4zoy.onrender.com");
      primus.on("data", (json) => {
        if (json.action === "update") {
          ordersCount.value = json.data.count;
          shoes.value = json.data.shoes;
        } else if (json.action === "post") {
          shoes.value.push(json.data.shoe);
          ordersCount.value = shoes.value.length;
        } else if (json.action === "updateStatus") {
          const index = shoes.value.findIndex(
            (shoe) => shoe._id === json.data.shoe._id
          );
          shoes.value[index] = json.data.shoe;
        }
      });
    };
  
    return { setupSocket };
  }
  