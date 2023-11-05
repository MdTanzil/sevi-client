
import useAxios from '../hooks/useAxios';


const fetching = async() => {
    const axios = useAxios()
    let data = null
    axios.get('/categories')
    .then(async(res)=>{
        data = await res.data
        return  data
    })
    return data
};

export default fetching;