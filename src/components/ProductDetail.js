import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import { productAPI } from '../services/api';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    productAPI.getProductById(productId).then((data) => {
      setProduct(data);
      setState('ready');
    }).catch(() => setState('error'));
  }, [productId]);

  const image = product?.outfitStyleRefImg?.[0] || product?.image || product?.images?.[0];

  return (
    <PublicLayout>
      <section className="product-detail-page">
        <Link className="public-back-link" to="/product">← Back to collection</Link>
        {state === 'loading' && <p className="public-status">Loading product details...</p>}
        {state === 'error' && <p className="public-status">We could not find that product.</p>}
        {state === 'ready' && product && <div className="product-detail-grid">
          <div className="detail-image-wrap">{image ? <img src={image} alt={product.name || 'Naari Art product'} /> : <span>Naari Art</span>}</div>
          <div className="product-detail-copy">
            <p className="public-eyebrow">Naari Art collection</p>
            <h1>{product.name || product.outfitTypeName || 'Naari Art piece'}</h1>
            <p className="detail-category">{product.subCategoryName || product.outfitTypeName || 'No Sub-categories available'}</p>
            <p>{product.description || 'A considered piece designed with expressive detail and an easy sense of occasion.'}</p>
            <Link className="public-button" to="/contact">Enquire about this piece</Link>
          </div>
        </div>}
      </section>
    </PublicLayout>
  );
};

export default ProductDetail;
