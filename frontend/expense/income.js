const api = "http://localhost:4000/expense";
const token = localStorage.getItem("token");
const handleIncome=async(event)=>{
    event.preventDefault()
    try {
        const response = await axios.patch(api,{
            autherization : `Bearer ${token}`
        })
    } catch (error) {
        console.log(error)
    }
}