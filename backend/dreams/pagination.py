from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class DreamSetPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = "page_size"
    max_page_size = 10000

    ALLOWED_PAGE_SIZES = [4, 8, 16, 10000]  # "all" == 10000

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.page.paginator.count,
                "num_pages": self.page.paginator.num_pages,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "allowed_page_sizes": self.ALLOWED_PAGE_SIZES,  # allowed values per page
                "results": data,
            }
        )

    def get_page_size(self, request):
        page_size = request.query_params.get(self.page_size_query_param)

        if page_size:
            try:
                page_size = int(page_size)
                if page_size in self.ALLOWED_PAGE_SIZES:  # checking is allowed value
                    return page_size
            except ValueError:
                pass  # ignore if no correct

        return self.page_size  # return default value
