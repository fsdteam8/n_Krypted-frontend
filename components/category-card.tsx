import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  icon: string;
  title?: string;
}

export function CategoryCard({ title, icon }: CategoryCardProps) {
  return (
    <Link href={`/deals?categoryName=${title}`}>
      <div className="flex  flex-col items-center justify-center border-2 border-white rounded-md gap-4 h-full duration-300 transition-all hover:shadow-[0px_0px_10px_2px_#FFFFFF] w-full md:w-[270px] group">
        <div className="flex justify-center">
          <Image
            src={icon || "/assets/category.png"}
            alt={`${title} Category Icon`}
            width={1000}
            height={1000}
            className="max-w-[190px] object-cover py-2 w-full h-[300px]"
          />
        </div>

        <div className="border-t-2 border-white w-full text-center py-2">
          <h1 className="text-[20px] font-bold text-white">
            {title || "Category"}
          </h1>
          {/* {auctions.length > 0 && <h1 className="text-[16px] font-medium text-white">{auctions.length} Items</h1>} */}
        </div>
      </div>
    </Link>
  );
}
