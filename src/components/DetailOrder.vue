<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const order = ref({});
const route = useRoute();
const router = useRouter();
const selectedStatus = ref('');


let primus = new Primus('https://sneaker-api-4zoy.onrender.com');

primus.on('open', () => {
  console.log('Connection is alive and kicking');
});

const fetchOrder = async () => {
  const id = route.params.id;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://sneaker-api-4zoy.onrender.com/api/v1/shoes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    order.value = data.data.shoe;
  } catch (error) {
    console.error('Error fetching order:', error);
    router.push('/error');
  }
};

const updateOrderStatus = async () => {
  const id = route.params.id;
  const status = selectedStatus.value;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://sneaker-api-4zoy.onrender.com/api/v1/shoes/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (primus.readyState == Primus.OPEN) {
      primus.write(JSON.stringify({ action: 'updateStatus', response: response }));
    }

    router.push('/orders');
  } catch (error) {
    console.error('Error updating order:', error);
    router.push('/error');
  }
};

onMounted(fetchOrder);

const statusClass = computed(() => {
  return {
    'text-green-500': order.value.status === 'accepted',
    'text-yellow-500': order.value.status === 'in progress',
    'text-red-500': order.value.status === 'denied',
  };
});

const removeOrder = async () => {
  if (order.value) {
    const id = order.value._id;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://sneaker-api-4zoy.onrender.com/api/v1/shoes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (primus.readyState == Primus.OPEN) {
        primus.write(JSON.stringify({ action: 'delete' }));
      }

      order.value = {};
      router.push('/orders');
    } catch (error) {
      console.error('Error removing order:', error);
      router.push('/error');
    }
  }
};

const confirmRemoveOrder = () => {
  const confirmMessage = 'Are you sure you want to remove this order?';
  if (confirm(confirmMessage)) {
    removeOrder();
  }
};

watch(() => selectedStatus.value, (newStatus, oldStatus) => {
  if (newStatus !== oldStatus) {
    updateOrderStatus();
  }
}, { immediate: false });
</script>

<template>
  <div class="container">
    <div class="background-image"></div>
    <div class="order-details-container" style="margin-left: 10px">
      <h1 class="order-header">Order details</h1>

      <div class="order-info">
        <div class="order-info-item">
          <span class="label">Order ID:</span>
          <span class="value">{{ order._id }}</span>
        </div>
        <div v-if="order.user" class="order-info-item">
          <span class="label">Client:</span>
          <span class="value">{{ order.user.username }}</span>
        </div>
        <div v-if="order.user" class="order-info-item">
          <span class="label">Email:</span>
          <a :href="'mailto:' + order.user.email" class="value">{{ order.user.email }}</a>
        </div>
        <div class="order-info-item">
          <span class="label">Date:</span>
          <span class="value">{{ new Date('2024-12-08').toLocaleDateString() }}</span>
        </div>
        <div class="order-info-item">
          <span class="label">Configuration option: color</span>
          <span class="value">Red</span>
        </div>
        <div class="order-info-item">
          <span class="label">Size:</span>
          <span class="value">42</span>
        </div>
        <div class="order-info-item" v-if="order.color">
          <span class="label">Color:</span>
          <span class="value">{{ order.color }}</span>
        </div>
        <div class="order-info-item">
          <span class="label">Total price:</span>
          <span class="value">€150.00</span> 
        </div>
        <div class="order-info-item">
          <span class="label">Status:</span>
          <span :class="statusClass" class="value">{{ order.status }}</span>
        </div>

        <div v-if="order.shipping" class="order-info-item">
          <span class="label">Shipping To:</span>
          <span class="value">{{ order.shipping.name }}</span>
        </div>
        <div v-if="order.shipping" class="order-info-item">
          <span class="label">Address:</span>
          <span class="value">{{ order.shipping.address }}</span>
        </div>
      </div>



      <div class="actions">
        <button @click="confirmRemoveOrder" class="remove-button">Remove order</button>
        <router-link to="/orders" class="go-back-link">Go back</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  height: 100vh;
  width: 100%;
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background-image: url('/img.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.6);
  z-index: -1;
}

.order-details-container {
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  padding: 40px;
  max-width: 700px;
  width: 100%;
  text-align: left;
}

.order-header {
  font-size: 3rem;
  margin-bottom: 10px;
  color: #333;
}

.order-info {
  margin-top: 20px;
}

.order-info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.label {
  color: #555;
}

.value {
  font-weight: bold;
  color: #333;
}

.status-update {
  margin-top: 20px;
}

.status-label {
  font-size: 1.1rem;
  color: #555;
}

.status-select {
  width: 100%;
  padding: 10px;
  background-color: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 10px;
  font-size: 1rem;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.remove-button {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
}

.remove-button:hover {
  background-color: #d32f2f;
}

.go-back-link {
  background-color: #26f158;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 1.1rem;
  text-align: center;
}

.go-back-link:hover {
  background-color: #25d350;
}

.remove-button {
  background-color: #333; 
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
}

.remove-button:hover {
  background-color: #555; 
}

</style>

