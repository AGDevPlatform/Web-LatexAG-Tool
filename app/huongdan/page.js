import Image from "next/image";
import React from "react";

export default function HuongDan() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex justify-center items-start">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-3xl">
        <div className="h-[100vh] overflow-y-auto">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Hướng dẫn sử dụng
            </h1>

            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  1. C&acirc;u hỏi trắc nghiệm 4 phương &aacute;n
                </p>
                <div className="text-gray-600">
                  <Image
                    className="mb-2"
                    src={"/HD1.png"}
                    alt="HD1"
                    width={1000}
                    height={100}
                  />
                  <p className="mb-5 font-bold"> 👉 Quy tắc c&acirc;u hỏi</p>
                  <div className="p-0">
                    <div className="grid grid-cols-1 gap-2 ">
                      <p>
                        - C&acirc;u hỏi phải bắt đầu bằng chữ{" "}
                        <strong>&quot;C&acirc;u&quot;</strong>. V&iacute; dụ:{" "}
                        <strong>&quot;C&acirc;u 1.&quot;</strong>,{" "}
                        <strong>&quot;C&acirc;u 2:&quot;</strong>
                        ,...
                      </p>
                      <p>
                        - C&aacute;c đ&aacute;p &aacute;n bắt buộc phải được bắt
                        đầu bằng{" "}
                        <strong>
                          {" "}
                          &quot;A.&quot;, &quot;B.&quot;, &quot;C.&quot;,
                          &quot;D.&quot;
                        </strong>
                        .
                      </p>
                      <p>
                        - Đ&aacute;p &aacute;n n&agrave;o đ&uacute;ng th&igrave;
                        điền dấu <strong>#</strong> ở đầu nội dung của
                        đ&aacute;p &aacute;n đ&oacute;. V&iacute; dụ:{" "}
                        <strong>A.</strong>
                        #Đ&aacute;p &aacute;n 1,...
                      </p>
                      <p>
                        - Lời giải bắt đầu bằng chữ{" "}
                        <strong>&quot;Lời giải&quot;</strong> đặt ở cuối
                        c&ugrave;ng c&acirc;u hỏi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4">
                <p className="text-center text-gray-500 text-sm">
                  © 2024 Công ty của bạn. Tất cả các quyền được bảo lưu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
