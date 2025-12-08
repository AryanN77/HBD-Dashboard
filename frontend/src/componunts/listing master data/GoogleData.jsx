import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Typography } from '@material-tailwind/react';
import { listingData } from '@/data/listingJSON';
const GoogleData = () => {
  const [loading, setLoading] = useState(false);
  const [fullData] = useState(listingData);  
  const [data, setData] = useState([]);    
  const [currentPage, setCurrentPage] = useState(1); 
  const limit = 10;

  const totalPages = Math.ceil(fullData.length / limit);

  // const fetchData = () => {
  //   const start = (currentPage - 1) * limit;
  //   const currData = fullData.slice(start, start + limit);      --->Mock Data Code
  //   setData(currData);
  // };

  const fetchData = async () => {
    const res = await api.get("/api/results");
    setFullData(res.data);  
  }

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {  
    const start = (currentPage - 1) * limit;  
    const currData = fullData.slice(start, start + limit);
    setData(currData);
  }, [currentPage, fullData])
  
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12 px-4">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-4 flex items-center justify-between"
        >
          <Typography variant="h6" color="white">Google Data</Typography>

          <div className="flex items-center gap-4">
            <Button
              variant="outlined"
              color="white"
              className="flex items-center gap-2"
              onClick={() => console.log("Download CSV")}
            >
              Download CSV
            </Button>

            <Typography variant="h6" color="white">
              Total: {fullData.length}
            </Typography>
          </div>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Business Name","Phone","Email","Website","Address","Latitude",
                "Longitude","Rating","Review","Category","Image1","Image2","Image3","Image4","Image5","Image6","Image7","Image8","Image9","Image10","Working Hour","Facebook Profile","Instagram Profile","LinkedIn Profile","Twitter Profile"].map((head) => (
                  <th key={head} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography
                      variant="small"
                      className="text-[15px] text-black font-bold uppercase "
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-5">{item.BusinessName || "-"}</td>
                  <td className="py-3 px-5">{item.Phone	 || "-"}</td>
                  <td className="py-3 px-5">{item.Email	 || "-"}</td>
                  <td className="py-3 px-5">{item.Website	 || "-"}</td>
                  <td className="py-3 px-5">{item.Address	 || "-"}</td>
                  <td className="py-3 px-5">{item.Latitude	 || "-"}</td>
                  <td className="py-3 px-5">{item.Longitude	 || "-"}</td>
                  <td className="py-3 px-5">{item.Rating	 || "-"}</td>
                  <td className="py-3 px-5">{item.Review	 || "-"}</td>
                  <td className="py-3 px-5">{item.Category	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image1	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image2	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image3	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image4	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image5	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image6	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image7	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image8	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image9	 || "-"}</td>
                  <td className="py-3 px-5">{item.Image10	 || "-"}</td>
                  <td className="py-3 px-5">{item.WorkingHour	 || "-"}</td>
                  <td className="py-3 px-5">{item.Facebookprofile	 || "-"}</td>
                  <td className="py-3 px-5">{item.instagramprofile	 || "-"}</td>
                  <td className="py-3 px-5">{item.linkedinprofile	 || "-"}</td>
                  <td className="py-3 px-5">{item.Twitterprofile || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>

        
          <button
            className="px-3 py-1 rounded border 
                bg-white text-blue-500
            "
          >
            {currentPage}
          </button>
        
        <button
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GoogleData;
