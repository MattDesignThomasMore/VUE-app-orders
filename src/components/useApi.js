export default function useApi() {
    const fetchUsers = async (token) => {
      const response = await fetch("https://sneaker-api-4zoy.onrender.com/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    };
  
    const fetchShoes = async (token) => {
      const response = await fetch(
        "https://sneaker-api-4zoy.onrender.com/api/v1/shoes",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.json();
    };
  
    return { fetchUsers, fetchShoes };
  }
  