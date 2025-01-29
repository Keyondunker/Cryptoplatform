def min_subarrays_with_sum(n, c):
    from functools import lru_cache

    @lru_cache(None)
    def dp(remaining, index):
        if remaining == 0:
            return 0
        if remaining < 0 or index == len(c):
            return float('inf')
        
        # Option 1: Take the current element and recurse
        take = 1 + dp(remaining - c[index], index + 1)
        
        # Option 2: Skip the current element and move to next
        skip = dp(remaining, index + 1)
        
        return min(take, skip)

    result = dp(n, 0)
    return result if result != float('inf') else -1

# Example usage
n = 5
c = [1, 2, 3, 4, 5]
print(min_subarrays_with_sum(n, c))  # Output example
