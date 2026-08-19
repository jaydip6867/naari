import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import { productAPI } from '../services/api';

const getImage = (product) => product?.outfitStyleRefImg?.[0] || product?.image || product?.images?.[0];

const PublicProduct = () => {
  const [products, setProducts] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    productAPI.getProducts().then((data) => {
      setProducts(Array.isArray(data) ? data : []);
      setState('ready');
    }).catch(() => setState('error'));
  }, []);

  return (
    <PublicLayout>
      <section className="public-catalog">
        <p className="public-eyebrow">The collection</p>
        <h1>Pieces to be remembered in.</h1>
        {state === 'loading' && <p className="public-status">Loading the collection...</p>}
        {state === 'error' && <p className="public-status">The collection is taking a moment. Please try again soon.</p>}
        {state === 'ready' && products.length === 0 && <p className="public-status">New pieces are arriving soon.</p>}
        <div className="product-grid">
          {products.map((product) => (
            <Link className="public-product-card" to={`/product/${product._id}`} key={product._id}>
              <div className="product-image-wrap">
                {getImage(product) ? <img src={getImage(product)} alt={product.name || 'Naari Art product'} /> : <span>Naari Art</span>}
              </div>
              <div className="product-card-copy"><h2>{product.name || product.outfitTypeName || 'Naari Art piece'}</h2><p>{product.subCategoryName || product.outfitTypeName || 'View details'}</p></div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default PublicProduct;
