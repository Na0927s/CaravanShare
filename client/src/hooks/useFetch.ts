import { useState, useEffect } from 'react';
import axios from 'axios';

// It's a good practice to have a central axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void; // Add a refetch function
}

const useFetch = <T>(url: string | null): FetchResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [trigger, setTrigger] = useState(0); // State to trigger refetch

  const refetch = () => {
    if (url) { // Only refetch if there is a URL
      setTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!url) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<T>(url);
        setData(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, trigger]); // Depend on url and the trigger

  return { data, loading, error, refetch };
};

export default useFetch;
