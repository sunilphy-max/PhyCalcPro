const API_URL = import.meta.env.VITE_API_URL;

useEffect(() => {
  fetch(`${API_URL}/hello`)
    .then(res => res.json())
    .then(data => setMsg(data.message));
}, []);

useEffect(() => {
  fetch(`${API_URL}/plot-test`)
    .then(res => res.json())
    .then(data => setPlot(`data:image/png;base64,${data.plot}`));
}, []);