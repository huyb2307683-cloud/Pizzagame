import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const defaultLevels = [
  { id: 1, problem: "Có 3 chiếc bánh pizza, chia đều cho 2 bạn. Mỗi bạn nhận được bao nhiêu phần bánh?", totalCakes: 3, shareWith: 2, correctWhole: 1, correctNumerator: 1, correctDenominator: 2 },
  { id: 2, problem: "Cô giáo có 5 chiếc bánh, chia đều cho 4 học sinh. Viết hỗn số chỉ phần bánh mỗi em nhận được.", totalCakes: 5, shareWith: 4, correctWhole: 1, correctNumerator: 1, correctDenominator: 4 },
  { id: 3, problem: "Mẹ có 7 chiếc bánh, chia đều cho 3 anh em. Mỗi người được mấy phần bánh?", totalCakes: 7, shareWith: 3, correctWhole: 2, correctNumerator: 1, correctDenominator: 3 },
  { id: 4, problem: "Có 9 chiếc bánh pizza, chia đều cho 4 bạn nhỏ. Mỗi bạn được bao nhiêu phần?", totalCakes: 9, shareWith: 4, correctWhole: 2, correctNumerator: 1, correctDenominator: 4 },
  { id: 5, problem: "Trong bữa tiệc có 11 chiếc bánh, chia cho 5 người. Hãy tìm hỗn số tương ứng.", totalCakes: 11, shareWith: 5, correctWhole: 2, correctNumerator: 1, correctDenominator: 5 },
  { id: 6, problem: "Có 4 chiếc bánh pizza, chia cho 3 người bạn. Mỗi người nhận được bao nhiêu?", totalCakes: 4, shareWith: 3, correctWhole: 1, correctNumerator: 1, correctDenominator: 3 },
  { id: 7, problem: "Có 13 cái bánh, chia đều cho 6 em bé. Mỗi em bé được bao nhiêu phần?", totalCakes: 13, shareWith: 6, correctWhole: 2, correctNumerator: 1, correctDenominator: 6 },
  { id: 8, problem: "Chia đều 15 cái bánh cho 4 bạn. Mỗi bạn nhận được bao nhiêu bánh?", totalCakes: 15, shareWith: 4, correctWhole: 3, correctNumerator: 3, correctDenominator: 4 },
  { id: 9, problem: "Có 17 chiếc bánh, chia cho 5 người. Viết kết quả dưới dạng hỗn số.", totalCakes: 17, shareWith: 5, correctWhole: 3, correctNumerator: 2, correctDenominator: 5 },
  { id: 10, problem: "Có 19 chiếc bánh, chia cho 6 bạn. Mỗi bạn được bao nhiêu phần bánh?", totalCakes: 19, shareWith: 6, correctWhole: 3, correctNumerator: 1, correctDenominator: 6 }
];

export async function generateLevels() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "Hãy tạo 10 bài toán về hỗn số cho học sinh tiểu học (JSON array: id, problem, totalCakes, shareWith, correctWhole, correctNumerator, correctDenominator).";

  try {
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
    return defaultLevels; 
  }
}