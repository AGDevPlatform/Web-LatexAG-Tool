import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faYoutube } from "@fortawesome/free-solid-svg-icons";
export default function HuongDan() {
  return (
    <div className="min-h-screen bg-white flex justify-center items-start">
      <div
        className="bg-white   overflow-hidden w-full"
        style={{ paddingLeft: "200px", paddingRight: "200px" }}
      >
        <div className="h-[100vh] overflow-y-auto">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">
              Hướng dẫn sử dụng
            </h1>
            <div className="flex justify-center items-center mb-3">
              <Link
                href="https://www.youtube.com/watch?v=pC9yvFWojlw"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="inline-block px-6 py-3 text-center bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition duration-300 text-center">
                  <FontAwesomeIcon icon={faYoutube} /> Video Hướng Dẫn
                </div>
              </Link>
            </div>

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
                    width={700}
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
                        <strong>&quot;Lời giải&quot;</strong> đặt ở dưới
                        c&ugrave;ng c&acirc;u hỏi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  2. C&acirc;u hỏi trắc nghiệm đúng sai
                </p>
                <div className="text-gray-600">
                  <Image
                    className="mb-2"
                    src={"/HD2.png"}
                    alt="HD1"
                    width={700}
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
                          &quot;a)&quot;, &quot;b)&quot;, &quot;c)&quot;,
                          &quot;d)&quot;
                        </strong>
                        .
                      </p>
                      <p>
                        - Đ&aacute;p &aacute;n n&agrave;o đ&uacute;ng th&igrave;
                        điền dấu <strong>#</strong> ở đầu nội dung của
                        đ&aacute;p &aacute;n đ&oacute;. V&iacute; dụ:{" "}
                        <strong>a)</strong>
                        #Đ&aacute;p &aacute;n 1,...
                      </p>
                      <p>
                        - Lời giải bắt đầu bằng chữ{" "}
                        <strong>&quot;Lời giải&quot;</strong> đặt ở phía dưới
                        c&ugrave;ng c&acirc;u hỏi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  3. C&acirc;u hỏi trả lời ngắn
                </p>
                <div className="text-gray-600">
                  <Image
                    className="mb-2"
                    src={"/HD3.png"}
                    alt="HD1"
                    width={700}
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
                        -Đáp số đặt sau <strong>#</strong> và được đặt ở cuối
                        câu hỏi.
                      </p>
                      <p>
                        - Lời giải bắt đầu bằng chữ{" "}
                        <strong>&quot;Lời giải&quot;</strong> đặt ở phía dưới
                        c&ugrave;ng c&acirc;u hỏi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white px-6 py-4">
                <p className="text-center text-gray-500 text-sm">
                  © 2024 Nguyen Duong The Vi. All right reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
