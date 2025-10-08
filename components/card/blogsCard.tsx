import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, ArrowUpRight, UserRound } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface Blog {
  authorName: ReactNode;
  _id: string;
  image?: string;
  title: string;
  createdAt: string;
}

function BlogsCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blog/${blog?._id}`} className="group block">
      <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1 max-w-[370px] rounded-xl ">
        <div className="relative overflow-hidden ">
          <Image
            src={blog?.image || "/placeholder.svg?height=222&width=370"}
            alt="Blog Image"
            width={1000}
            height={1000}
            className="h-[205px] lg:h-[222px] w-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
              <ArrowUpRight className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>

        <div className="p-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between space-x-4 mb-4">
              <div className="flex items-center  space-x-2  text-gray-600">
                <UserRound className="w-4 h-4" />
                <span className="text-sm font-medium text-nowrap">
                  {blog?.authorName}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 text-nowrap">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {new Date(blog?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <h3 className="font-semibold text-[16px] leading-[1.4] text-black group-hover:text-gray-700 transition-colors duration-300 line-clamp-2 mb-4 min-h-[3.0rem]">
              {blog?.title}
            </h3>

            {/* <div className="flex items-center text-black opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <span className="text-sm font-medium">Read more</span>
              <ArrowUpRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </div> */}
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export default BlogsCard;
