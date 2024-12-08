<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const ordersCount = ref(4);
const usersCount = ref(5);
const shoes = ref([]);
const loading = ref(true);
const errorMessage = ref("");


let primus = new Primus("https://sneaker-api-4zoy.onrender.com");

primus.on("open", () => {
  console.log("Connection is open.");
});

primus.on("data", (json) => {
  console.log("Received message from server:", json);

  if (json.action === "update") {
    shoes.value = json.data.shoes.map((shoe) => ({ ...shoe, price: 150 }));
    ordersCount.value = json.data.count;
  }

  if (json.action === "post") {
    const newShoe = { ...json.data.shoe, price: 150 };
    shoes.value.push(newShoe);
    ordersCount.value = shoes.value.length;
  }

  if (json.action === "updateStatus") {
    const index = shoes.value.findIndex((shoe) => shoe._id === json.data.shoe._id);
    if (index !== -1) {
      shoes.value[index] = { ...json.data.shoe, price: 150 };
    }
  }

  if (json.action === "delete") {
    const index = shoes.value.findIndex((shoe) => shoe._id === json.data._id);
    if (index !== -1) {
      shoes.value.splice(index, 1);
      ordersCount.value = shoes.value.length;
    }
  }
});

const searchQuery = ref("");
const filteredShoes = computed(() => {
  return shoes.value.filter((shoe) =>
    shoe._id.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  try {
    const ordersResponse = await fetch("https://sneaker-api-4zoy.onrender.com/api/v1/shoes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!ordersResponse.ok) {
      throw new Error(`Error fetching orders: ${ordersResponse.status}`);
    }

    const ordersData = await ordersResponse.json();
    ordersCount.value = 4;
    shoes.value = ordersData.data.shoes.slice(0, 9).map((shoe) => ({
      ...shoe,
      price: 150,
      date: shoe._id === "657c49d335c535818c8c7786"
        ? "2024-12-08"
        : getRandomDate(new Date("2024-12-01"), new Date("2024-12-07")),
    }));

    if (primus.readyState === Primus.OPEN) {
      primus.write(
        JSON.stringify({
          action: "update",
          data: {
            ordersCount: ordersCount.value,
            shoes: shoes.value,
          },
        })
      );
    }

    loading.value = false;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Failed to load data. Please try again later.";
    loading.value = false;
  }
});

const getRandomDate = (start, end) => {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split("T")[0];
};

const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/#/";
};

const sortOptions = ref({
  field: "date",
  order: "asc",
});

const changeSort = (field) => {
  if (sortOptions.value.field === field) {
    sortOptions.value.order = sortOptions.value.order === "asc" ? "desc" : "asc";
  } else {
    sortOptions.value.field = field;
    sortOptions.value.order = "asc";
  }
};

const sortedShoes = computed(() => {
  const sorted = [...filteredShoes.value];
  const { field, order } = sortOptions.value;
  return sorted.sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    if (order === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
});

const updateStatus = (shoe) => {
  const newStatus = shoe.status === "completed" ? "pending" : "completed";
  const updatedShoe = { ...shoe, status: newStatus, price: 150 };

  primus.write(
    JSON.stringify({
      action: "updateStatus",
      data: {
        shoe: updatedShoe,
      },
    })
  );

  const index = shoes.value.findIndex((s) => s._id === shoe._id);
  if (index !== -1) {
    shoes.value[index] = updatedShoe;
  }
};

const deleteOrder = (shoeId) => {
  primus.write(
    JSON.stringify({
      action: "delete",
      data: {
        _id: shoeId,
      },
    })
  );
  const index = shoes.value.findIndex((shoe) => shoe._id === shoeId);
  if (index !== -1) {
    shoes.value.splice(index, 1);
    ordersCount.value = shoes.value.length;
  }
};

const navigateToDetail = (shoeId) => {
  router.push(`/orders/${shoeId}`);
};

const currency = (value) => {
  return `$${value.toFixed(2)}`;
};
</script>

<template :class="{ 'theme-dark': dark }">
  <main class="h-full pb-16 overflow-y-auto bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white fixed inset-0">
    <div class="container mx-auto px-6 py-12">
      <!-- Stats Section -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article class="bg-gradient-to-r from-green-500 to-green-700 rounded-xl shadow-xl p-6 flex items-center justify-between space-x-6 hover:scale-105 transition-transform duration-300 ease-in-out">
          <div class="flex flex-col">
            <h4 class="text-4xl font-bold">{{ usersCount }}</h4>
            <p class="text-lg font-medium opacity-80">Users</p>
          </div>
        </article>

        <article class="bg-gradient-to-r from-gray-800 to-gray-600 rounded-xl shadow-xl p-6 flex items-center justify-between space-x-6 hover:scale-105 transition-transform duration-300 ease-in-out">
          <div class="flex flex-col">
            <h4 class="text-4xl font-bold">{{ ordersCount }}</h4>
            <p class="text-lg font-medium opacity-80">Orders</p>
          </div>
        </article>
      </section>

      <section class="mt-8 mb-6">
        <div class="flex items-center justify-between">
          <input
            type="text"
            v-model="searchQuery"
            class="w-full max-w-lg p-4 text-lg rounded-xl shadow-lg border-2 border-green-600 focus:ring-2 focus:ring-green-500 transition-all ease-in-out text-black"
            placeholder="Search by Order ID"
          />

          <div class="space-x-4">
            <button @click="changeSort('date')" class="btn btn-outline px-6 py-3 text-md bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full hover:bg-green-800 transition-all ease-in-out">Sort by Date</button>
            <button @click="changeSort('price')" class="btn btn-outline px-6 py-3 text-md bg-gradient-to-r from-gray-800 to-gray-600 text-white rounded-full hover:bg-gray-600 transition-all ease-in-out">Sort by Price</button>
          </div>
        </div>
      </section>

   
      <section v-if="loading" class="text-center py-6">
        <p class="text-white">Loading...</p>
      </section>

     
      <section v-if="errorMessage" class="text-center py-6">
        <p class="text-red-500">{{ errorMessage }}</p>
      </section>

     
      <section class="bg-gray-900 text-white shadow-xl rounded-2xl overflow-hidden">
        <table class="min-w-full table-auto text-sm">
          <thead class="bg-gray-800 text-left text-gray-200">
            <tr>
              <th @click="changeSort('date')" class="cursor-pointer px-6 py-4 font-semibold">Order ID</th>
              <th @click="changeSort('price')" class="cursor-pointer px-6 py-4 font-semibold">Price</th>
              <th @click="changeSort('status')" class="cursor-pointer px-6 py-4 font-semibold">Status</th>
              <th @click="changeSort('date')" class="cursor-pointer px-6 py-4 font-semibold">Date</th>
              <th class="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shoe in sortedShoes" :key="shoe._id" class="hover:bg-gray-700 transition-all ease-in-out">
              <td @click="navigateToDetail(shoe._id)" class="cursor-pointer px-6 py-4 text-gray-300">{{ shoe._id }}</td>
              <td class="px-6 py-4 text-gray-300">{{ currency(shoe.price) }}</td>
              <td class="px-6 py-4">
                <span :class="{
                  'bg-green-600 text-white': shoe.status === 'completed',
                  'bg-yellow-500 text-black': shoe.status === 'pending',
                  'bg-red-600 text-white': shoe.status === 'cancelled'
                }" class="px-3 py-1 text-xs font-semibold rounded-full">{{ shoe.status }}</span>
                <button @click="updateStatus(shoe)" class="ml-4 text-green-400 hover:text-green-600 transition-all ease-in-out">Change Status</button>
              </td>
              <td class="px-6 py-4 text-gray-300">{{ shoe.date }}</td>
              <td class="px-6 py-4">
                <button @click="deleteOrder(shoe._id)" class="text-red-400 hover:text-red-600 transition-all ease-in-out">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="mt-6 text-center" style="margin-top: 10vh">
        <button @click="logout" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all ease-in-out">Logout</button>
      </section>
    </div>
  </main>
</template>
