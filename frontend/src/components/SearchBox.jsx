import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBox = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      // Navigate to home page with keyword query parameter
      navigate(`/?keyword=${keyword.trim()}`);
      setKeyword(''); // Clear the input after search
    } else {
      // If keyword is empty, navigate to home without keyword (clears previous search)
      navigate('/');
    }
  };

  return (
    <form onSubmit={submitHandler} style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
      <input
        type="text"
        name='q'
        onChange={(e) => setKeyword(e.target.value)}
        value={keyword}
        placeholder='Search Products...'
        style={{
          padding: '12px 20px',
          border: '1px solid #333',
          borderRadius: '30px 0 0 30px',
          outline: 'none',
          fontSize: '15px',
          width: '350px',
          backgroundColor: '#1a1a1a',
          color: '#f4f4f4',
          transition: 'all 0.3s ease'
        }}
      />
      <button
        type='submit'
        style={{
          padding: '12px 24px',
          backgroundColor: '#4F46E5', // Premium Indigo Accent
          color: '#fff',
          border: 'none',
          borderRadius: '0 30px 30px 0',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: '600',
          transition: 'background-color 0.2s ease'
        }}
      >
        Search
      </button>
    </form>
  );
};

export default SearchBox;