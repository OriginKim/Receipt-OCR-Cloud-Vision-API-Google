import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 별도의 CSS 파일 없이 이 파일 안에서 모든 스타일을 처리합니다.
const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f4f7f9',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: '#333',
        padding: '20px'
    },
    nav: {
        backgroundColor: '#fff',
        padding: '15px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderRadius: '12px',
        marginBottom: '30px'
    },
    logo: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#1a73e8',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    dashboard: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    card: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        border: '1px solid #eef2f6'
    },
    uploadBox: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        border: '2px dashed #cbd5e0',
        marginBottom: '40px',
        cursor: 'pointer'
    },
    button: {
        backgroundColor: '#1a73e8',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        width: '100%',
        marginTop: '15px',
        transition: 'background 0.3s'
    },
    receiptItem: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        borderLeft: '5px solid #1a73e8',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
    },
    amount: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#1a73e8'
    }
};

function App() {
    const [receipts, setReceipts] = useState([]);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReceipts = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/receipts');
            setReceipts(res.data.reverse());
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    useEffect(() => { fetchReceipts(); }, []);

    const onFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('http://localhost:8080/api/receipts/upload', formData);
            setFile(null);
            setPreview(null);
            fetchReceipts();
            alert("분석 완료!");
        } catch (err) {
            alert("분석 실패: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = receipts.reduce((sum, r) => sum + r.totalAmount, 0);

    return (
        <div style={styles.container}>
            <nav style={styles.nav}>
                <div style={styles.logo}>🧾 Receipt AI Scanner</div>
                <div style={{color: '#666', fontSize: '14px'}}>환영합니다, 사용자님</div>
            </nav>

            <div style={{maxWidth: '800px', margin: '0 auto'}}>
                <div style={styles.dashboard}>
                    <div style={styles.card}>
                        <div style={{color: '#888', fontSize: '12px', marginBottom: '5px'}}>총 지출</div>
                        <div style={{fontSize: '24px', fontWeight: 'bold'}}>{totalAmount.toLocaleString()}원</div>
                    </div>
                    <div style={styles.card}>
                        <div style={{color: '#888', fontSize: '12px', marginBottom: '5px'}}>스캔 건수</div>
                        <div style={{fontSize: '24px', fontWeight: 'bold'}}>{receipts.length}건</div>
                    </div>
                </div>

                <div style={styles.uploadBox}>
                    <h3 style={{marginBottom: '15px'}}>영수증 사진 올리기</h3>
                    <input type="file" onChange={onFileChange} style={{marginBottom: '15px'}} />
                    {preview && (
                        <div>
                            <img src={preview} alt="미리보기" style={{maxWidth: '100%', maxHeight: '300px', borderRadius: '10px', marginBottom: '15px'}} />
                            <button
                                onClick={handleUpload}
                                style={{...styles.button, backgroundColor: loading ? '#ccc' : '#1a73e8'}}
                                disabled={loading}
                            >
                                {loading ? "AI 분석 중..." : "분석 시작하기"}
                            </button>
                        </div>
                    )}
                </div>

                <h3 style={{marginBottom: '20px', color: '#555'}}>최근 분석 내역</h3>
                {receipts.map(r => (
                    <div key={r.id} style={styles.receiptItem}>
                        <div>
                            <div style={{fontWeight: 'bold', fontSize: '16px'}}>{r.storeName}</div>
                            <div style={{color: '#999', fontSize: '13px', marginTop: '4px'}}>{r.tradeDate || "날짜 미검출"}</div>
                        </div>
                        <div style={styles.amount}>{r.totalAmount.toLocaleString()}원</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;