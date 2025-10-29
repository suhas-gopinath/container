export const submit = async (setMessage: (value: string) => void) => {
  try {
    const token = sessionStorage.getItem("jwt");
    const response = await fetch("http://localhost:8080/users/verify", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    const data = await response.json();
    alert(data.message);
  } catch (error) {
    alert("Something went worng.");
  }
};
