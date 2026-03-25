export const submit = async () => {
  try {
    const token = sessionStorage.getItem("jwt");
    const response = await fetch("http://localhost:90/users/verify/v1", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    const data = await response.json();
    alert(data.message);
  } catch {
    alert("Something went worng.");
  }
};
