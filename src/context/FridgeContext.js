import { createContext, useState, useContext } from "react";
import apiClient from "../utils/api";

const FridgeContext = createContext();

export const useFridge = () => {
    const context = useContext(FridgeContext);
    if (!context) {
        throw new Error("잘못된 접근입니다.");
    }
    return context;
};

export const FridgeProvider = ({ children }) => {
    const [items, setItems] = useState([]);

    const addItem = async (itemData) => {
        try {
            const response = await apiClient.post("/fridge/items", itemData);
            
            setItems((prev) => [...prev, response.data]);
            return { success: true };
        } catch (error) {
            console.error("아이템 추가 실패:", error);
            return {
                success: false,
                error: error.response?.data?.message || "추가 실패"
            };
        }
    };

    const fetchItems = async () => {
        try {
            const response = await apiClient.get("/fridge/items");
            setItems(response.data);
        } catch (error) {
            console.error("목록 불러오기 실패:", error);
        }
    };

    const value = {
        items,
        addItem,
        fetchItems
    };

    return (
        <FridgeContext.Provider value={value}>
            {children}
        </FridgeContext.Provider>
    );
};