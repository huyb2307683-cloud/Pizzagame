import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

// DỮ LIỆU DỰ PHÒNG: Giúp game chạy ngay lập tức nếu AI phản hồi chậm
const defaultLevels = [
  {
    id: 1,
    problem: "Có 3 chiếc bánh pizza, chia đều cho 2 bạn. Mỗi bạn nhận được bao nhiêu phần bánh?",
    totalCakes: 3,
    shareWith: 2,
    correctWhole: 1,
    correctNumerator: 1,
    correctDenominator: 2
  },
  {
    id: 2,
    problem: "Cô giáo có 5 chiếc bánh, chia đều cho 4 học sinh. Viết hỗn số chỉ phần bánh mỗi em nhận được.",
    totalCakes: 5,
    shareWith: 4,
    correctWhole: 1,
    correctNumerator: 1,
    correctDenominator: 4
  }
];

export async function generateLevels() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "Hãy tạo 10 bài toán về hỗn số cho học sinh tiểu học (JSON: id, problem, totalCakes, shareWith, correctWhole, correctNumerator, correctDenominator).";

  try {
    // Thêm cơ chế Timeout 5 giây để không bắt người dùng chờ quá lâu
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);
    
    return Array.isArray(data) && data.length > 0 ? data : defaultLevels; 
  } catch (error) {
    console.warn("Sử dụng dữ liệu dự phòng do lỗi hoặc AI phản hồi chậm:", error);
    return defaultLevels; 
  }
}