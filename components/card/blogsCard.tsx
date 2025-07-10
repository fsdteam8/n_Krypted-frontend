import React from "react";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Calendar, UserRound } from "lucide-react";
import { Blog } from "@/app/blog/_components/type";
import Link from "next/link";

function BlogsCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blog/${blog?._id}`}>
      <Card className="overflow-hidden border-none text-white bg-[#212121] hover:bg-[#2a2a2a] transition-colors duration-300">
        <div className="relative overflow-hidden">
          <Image
            src={blog?.image || "/assets/manCard.png"}
            alt="Blog Image"
            width={1000}
            height={1000}
            className="h-[205px] lg:h-[222px] rounded-md w-full object-cover hover:brightness-90 transition-all duration-300"
          />
        </div>

        <div className="py-3">
          <CardContent className="p-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <UserRound className="w-[15px] h-[15px] text-white/80" />
                <p className="text-xs text-white/80">admin</p>
              </div>
              <div className="text-[12px] flex items-center space-x-2">
                <Calendar className="w-[15px] h-[15px] text-white/80" />
                <div className="text-white/80">
                  {new Date(blog?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <h3 className="mt-2 font-medium text-[18px] text-white">
              {blog?.title?.slice(0, 55)}...
            </h3>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export default BlogsCard;
