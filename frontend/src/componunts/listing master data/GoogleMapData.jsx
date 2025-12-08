import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Typography } from '@material-tailwind/react';
import { listingData } from '@/data/listingJSON';
const GoogleMapData = () => {
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
          <Typography variant="h6" color="white">Google Map Data</Typography>

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
                {["Name","Mobile Number	","Review Count	","Rating	","Catagory	","Address	",
                "Website","Email Id	","PlusCode	","Closing Hours	","latitude	","longitude	","Instagram ","Profile	","Facebook ","Profile	","Linkedin Profile	","Twitter Profile	","Images Folder"].map((head) => (
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
                  <td className="py-3 px-5">{item.Name	 || "-"}</td>
                  <td className="py-3 px-5">{item.MobileNumber		 || "-"}</td>
                  <td className="py-3 px-5">{item.ReviewCount		 || "-"}</td>
                  <td className="py-3 px-5">{item.Rating		 || "-"}</td>
                  <td className="py-3 px-5">{item.Catagory		 || "-"}</td>
                  <td className="py-3 px-5">{item.Address		 || "-"}</td>
                  <td className="py-3 px-5">{item.Website		 || "-"}</td>
                  <td className="py-3 px-5">{item.EmailId		 || "-"}</td>
                  <td className="py-3 px-5">{item.PlusCode		 || "-"}</td>
                  <td className="py-3 px-5">{item.ClosingHours		 || "-"}</td>
                  <td className="py-3 px-5">{item.latitude		 || "-"}</td>
                  <td className="py-3 px-5">{item.longitude		 || "-"}</td>
                  <td className="py-3 px-5">{item.Instagram 	 || "-"}</td>
                  <td className="py-3 px-5">{item.Profile		 || "-"}</td>
                  <td className="py-3 px-5">{item.Facebook 	 || "-"}</td>
                  <td className="py-3 px-5">{item.Profile		 || "-"}</td>
                  <td className="py-3 px-5">{item.LinkedinProfile		 || "-"}</td>
                  <td className="py-3 px-5">{item.TwitterProfile		 || "-"}</td>
                  <td className="py-3 px-5">{item.ImagesFolder	 || "-"}</td>
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

export default GoogleMapData;
